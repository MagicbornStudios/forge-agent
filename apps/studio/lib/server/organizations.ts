import type { Payload } from 'payload';

export type AuthenticatedUser = {
  id: number;
  email?: string | null;
  name?: string | null;
  defaultOrganization?: number | { id: number } | null;
  stripeConnectAccountId?: string | null;
};

export type OrganizationMembershipSummary = {
  organizationId: number;
  organizationName: string;
  organizationSlug: string;
  role: 'owner' | 'member';
  stripeConnectAccountId?: string | null;
  stripeConnectOnboardingComplete?: boolean | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumericId((value as { id?: unknown }).id);
  }
  return null;
}

function readDefaultOrganizationId(user: AuthenticatedUser): number | null {
  return asNumericId(user.defaultOrganization);
}

function buildPersonalOrgName(user: AuthenticatedUser): string {
  const base =
    typeof user.name === 'string' && user.name.trim().length > 0
      ? user.name.trim()
      : typeof user.email === 'string' && user.email.includes('@')
        ? user.email.split('@')[0]
        : 'Creator';
  return `${base} Workspace`;
}

function buildPersonalOrgSlug(user: AuthenticatedUser): string {
  const base =
    typeof user.email === 'string' && user.email.includes('@')
      ? user.email.split('@')[0]
      : buildPersonalOrgName(user);
  const normalized = slugify(base) || `creator-${user.id}`;
  return `${normalized}-${user.id}`;
}

type MembershipDoc = {
  id: number;
  role?: 'owner' | 'member';
  organization?: number | {
    id: number;
    name?: string;
    slug?: string;
    stripeConnectAccountId?: string | null;
    stripeConnectOnboardingComplete?: boolean | null;
  } | null;
};

export async function requireAuthenticatedUser(
  payload: Payload,
  headers: Headers,
): Promise<AuthenticatedUser | null> {
  const { user } = await payload.auth({
    headers,
    canSetHeaders: false,
  });
  if (!user || typeof user.id !== 'number') {
    return null;
  }
  return user as AuthenticatedUser;
}

async function listMembershipDocs(
  payload: Payload,
  userId: number,
): Promise<MembershipDoc[]> {
  const result = await payload.find({
    collection: 'organization-memberships',
    where: { user: { equals: userId } },
    depth: 1,
    limit: 200,
    sort: 'createdAt',
  });
  return result.docs as MembershipDoc[];
}

function toMembershipSummaries(docs: MembershipDoc[]): OrganizationMembershipSummary[] {
  const summaries: OrganizationMembershipSummary[] = [];
  for (const doc of docs) {
    const organization = doc.organization;
    const organizationId = asNumericId(organization);
    if (organizationId == null) continue;

    const hydrated =
      typeof organization === 'object' && organization != null
        ? organization
        : null;
    const role: OrganizationMembershipSummary['role'] =
      doc.role === 'owner' ? 'owner' : 'member';

    summaries.push({
      organizationId,
      organizationName:
        hydrated?.name && hydrated.name.trim().length > 0
          ? hydrated.name
          : `Organization ${organizationId}`,
      organizationSlug:
        hydrated?.slug && hydrated.slug.trim().length > 0
          ? hydrated.slug
          : `organization-${organizationId}`,
      role,
      stripeConnectAccountId: hydrated?.stripeConnectAccountId ?? null,
      stripeConnectOnboardingComplete:
        hydrated?.stripeConnectOnboardingComplete ?? null,
    });
  }
  return summaries;
}

async function createPersonalOrganization(
  payload: Payload,
  user: AuthenticatedUser,
): Promise<OrganizationMembershipSummary> {
  const createdOrganization = await payload.create({
    collection: 'organizations',
    draft: false,
    data: {
      name: buildPersonalOrgName(user),
      slug: buildPersonalOrgSlug(user),
      owner: user.id,
    },
    overrideAccess: true,
  });

  await payload.create({
    collection: 'organization-memberships',
    draft: false,
    data: {
      organization: createdOrganization.id,
      user: user.id,
      role: 'owner',
    },
    overrideAccess: true,
  });

  await payload.update({
    collection: 'users',
    draft: false,
    id: user.id,
    data: {
      defaultOrganization: createdOrganization.id,
    },
    overrideAccess: true,
  });

  return {
    organizationId: createdOrganization.id,
    organizationName: createdOrganization.name,
    organizationSlug: createdOrganization.slug,
    role: 'owner',
    stripeConnectAccountId: createdOrganization.stripeConnectAccountId ?? null,
    stripeConnectOnboardingComplete:
      createdOrganization.stripeConnectOnboardingComplete ?? false,
  };
}

export async function ensureOrganizationContext(
  payload: Payload,
  user: AuthenticatedUser,
): Promise<{
  memberships: OrganizationMembershipSummary[];
  activeOrganizationId: number;
}> {
  let memberships = toMembershipSummaries(await listMembershipDocs(payload, user.id));
  if (memberships.length === 0) {
    const created = await createPersonalOrganization(payload, user);
    memberships = [created];
    return {
      memberships,
      activeOrganizationId: created.organizationId,
    };
  }

  const defaultOrganizationId = readDefaultOrganizationId(user);
  const fallbackOrganizationId = memberships[0].organizationId;
  const activeOrganizationId =
    defaultOrganizationId != null &&
    memberships.some((membership) => membership.organizationId === defaultOrganizationId)
      ? defaultOrganizationId
      : fallbackOrganizationId;

  if (defaultOrganizationId !== activeOrganizationId) {
    await payload.update({
      collection: 'users',
      draft: false,
      id: user.id,
      data: {
        defaultOrganization: activeOrganizationId,
      },
      overrideAccess: true,
    });
  }

  return { memberships, activeOrganizationId };
}

export async function resolveOrganizationFromInput(
  payload: Payload,
  user: AuthenticatedUser,
  requestedOrganizationId?: number | null,
  options?: { strictRequestedMembership?: boolean },
): Promise<{
  memberships: OrganizationMembershipSummary[];
  activeOrganizationId: number;
}> {
  const context = await ensureOrganizationContext(payload, user);
  if (
    requestedOrganizationId != null &&
    context.memberships.some(
      (membership) => membership.organizationId === requestedOrganizationId,
    )
  ) {
    if (context.activeOrganizationId !== requestedOrganizationId) {
      await payload.update({
        collection: 'users',
        draft: false,
        id: user.id,
        data: {
          defaultOrganization: requestedOrganizationId,
        },
        overrideAccess: true,
      });
    }
    return {
      memberships: context.memberships,
      activeOrganizationId: requestedOrganizationId,
    };
  }

  if (
    requestedOrganizationId != null &&
    options?.strictRequestedMembership === true
  ) {
    throw new Error('Not a member of requested organization');
  }

  return context;
}

export function parseOrganizationIdFromRequestUrl(req: Request): number | null {
  const url = new URL(req.url);
  const raw = url.searchParams.get('orgId');
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

import type { PayloadRequest, Where } from 'payload';

type AccessRequest = {
  user?: PayloadRequest['user'];
  payload?: PayloadRequest['payload'];
  __membershipOrgIdsCache?: number[];
  __projectIdsCache?: number[];
  __pageIdsCache?: number[];
} & PayloadRequest;

type AccessContext = {
  req: AccessRequest;
};

const EMPTY_WHERE: Where = {
  id: {
    equals: -1,
  },
} as unknown as Where;

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

function getUserId(req: AccessRequest): number | null {
  return asNumericId(req.user?.id);
}

function getDefaultOrganizationId(req: AccessRequest): number | null {
  return asNumericId(req.user?.defaultOrganization);
}

function getMembershipOrganizationId(doc: unknown): number | null {
  if (!doc || typeof doc !== 'object') return null;
  return asNumericId((doc as { organization?: unknown }).organization);
}

export function requireAuthenticated({ req }: AccessContext): boolean {
  return getUserId(req) != null;
}

export function isAdminUser(req: AccessRequest): boolean {
  return req.user?.role === 'admin';
}

export function selfOnlyAccess({ req }: AccessContext): boolean | Where {
  const userId = getUserId(req);
  if (userId == null) return false;
  if (isAdminUser(req)) return true;
  return {
    id: {
      equals: userId,
    },
  } as unknown as Where;
}

async function getMembershipOrganizationIds(req: AccessRequest): Promise<number[]> {
  if (Array.isArray(req.__membershipOrgIdsCache)) {
    return req.__membershipOrgIdsCache;
  }

  const payload = req.payload;
  const userId = getUserId(req);
  if (!payload || userId == null) {
    req.__membershipOrgIdsCache = [];
    return [];
  }

  const memberships = await payload.find({
    collection: 'organization-memberships',
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 0,
    limit: 500,
    overrideAccess: true,
  });

  const orgIds = new Set<number>();
  const defaultOrgId = getDefaultOrganizationId(req);
  if (defaultOrgId != null) {
    orgIds.add(defaultOrgId);
  }

  for (const doc of memberships.docs) {
    const orgId = getMembershipOrganizationId(doc);
    if (orgId != null) orgIds.add(orgId);
  }

  const resolved = [...orgIds];
  req.__membershipOrgIdsCache = resolved;
  return resolved;
}

export async function organizationScopedAccess(
  { req }: AccessContext,
  options?: {
    ownerField?: string;
    organizationField?: string;
  },
): Promise<boolean | Where> {
  const userId = getUserId(req);
  if (userId == null) return false;
  if (isAdminUser(req)) return true;

  const ownerField = options?.ownerField;
  const organizationField = options?.organizationField ?? 'organization';
  const organizationIds = await getMembershipOrganizationIds(req);

  const clauses: Where[] = [];

  if (ownerField) {
    clauses.push({
      [ownerField]: {
        equals: userId,
      },
    } as unknown as Where);
  }

  if (organizationIds.length > 0) {
    clauses.push({
      [organizationField]: {
        in: organizationIds,
      },
    } as unknown as Where);
  }

  if (ownerField) {
    clauses.push({
      and: [
        {
          [ownerField]: {
            equals: userId,
          },
        },
        {
          [organizationField]: {
            exists: false,
          },
        },
      ],
    } as unknown as Where);
  }

  if (clauses.length === 0) return false;
  if (clauses.length === 1) return clauses[0];

  return {
    or: clauses,
  } as unknown as Where;
}

async function getAccessibleProjectIds(req: AccessRequest): Promise<number[]> {
  if (Array.isArray(req.__projectIdsCache)) {
    return req.__projectIdsCache;
  }

  const payload = req.payload;
  if (!payload) {
    req.__projectIdsCache = [];
    return [];
  }

  const where = await organizationScopedAccess(
    { req },
    {
      ownerField: 'owner',
      organizationField: 'organization',
    },
  );

  if (where === false) {
    req.__projectIdsCache = [];
    return [];
  }

  const result = await payload.find({
    collection: 'projects',
    ...(where === true ? {} : { where }),
    depth: 0,
    limit: 2000,
    overrideAccess: true,
  });

  const ids = result.docs
    .map((doc) => asNumericId((doc as { id?: unknown }).id))
    .filter((value): value is number => value != null);

  req.__projectIdsCache = ids;
  return ids;
}

export async function projectScopedAccess(
  { req }: AccessContext,
  options?: {
    projectField?: string;
  },
): Promise<boolean | Where> {
  const userId = getUserId(req);
  if (userId == null) return false;
  if (isAdminUser(req)) return true;

  const projectIds = await getAccessibleProjectIds(req);
  if (projectIds.length === 0) {
    return EMPTY_WHERE;
  }

  const projectField = options?.projectField ?? 'project';
  return {
    [projectField]: {
      in: projectIds,
    },
  } as unknown as Where;
}

async function getAccessiblePageIds(req: AccessRequest): Promise<number[]> {
  if (Array.isArray(req.__pageIdsCache)) {
    return req.__pageIdsCache;
  }

  const payload = req.payload;
  if (!payload) {
    req.__pageIdsCache = [];
    return [];
  }

  const projectIds = await getAccessibleProjectIds(req);
  if (projectIds.length === 0) {
    req.__pageIdsCache = [];
    return [];
  }

  const pages = await payload.find({
    collection: 'pages',
    where: {
      project: {
        in: projectIds,
      },
    },
    depth: 0,
    limit: 5000,
    overrideAccess: true,
  });

  const ids = pages.docs
    .map((doc) => asNumericId((doc as { id?: unknown }).id))
    .filter((value): value is number => value != null);

  req.__pageIdsCache = ids;
  return ids;
}

export async function pageScopedAccess(
  { req }: AccessContext,
  options?: {
    pageField?: string;
  },
): Promise<boolean | Where> {
  const userId = getUserId(req);
  if (userId == null) return false;
  if (isAdminUser(req)) return true;

  const pageIds = await getAccessiblePageIds(req);
  if (pageIds.length === 0) {
    return EMPTY_WHERE;
  }

  const pageField = options?.pageField ?? 'page';
  return {
    [pageField]: {
      in: pageIds,
    },
  } as unknown as Where;
}

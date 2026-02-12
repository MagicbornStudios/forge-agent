import type { Payload } from 'payload';
import {
  resolveOrganizationFromInput,
  type AuthenticatedUser,
  type OrganizationMembershipSummary,
} from '../organizations.ts';

export const DEFAULT_PLAN_TIER = 'free';
export const DEFAULT_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;
export const DEFAULT_STORAGE_WARNING_THRESHOLD_PERCENT = 80;

export type PlanTier = 'free' | 'pro' | 'enterprise';

export type BillingOrganizationSnapshot = {
  organizationId: number;
  organizationName: string;
  organizationSlug: string;
  role: 'owner' | 'member';
  stripeConnectAccountId: string | null;
  stripeConnectOnboardingComplete: boolean;
  planTier: PlanTier;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  storageWarningThresholdPercent: number;
  enterpriseSourceAccess: boolean;
  enterprisePremiumSupport: boolean;
  enterpriseCustomEditors: boolean;
  stripeCustomerId: string | null;
};

function asNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumericId((value as { id?: unknown }).id);
  }
  return null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toPlanTier(value: unknown): PlanTier {
  return value === 'pro' || value === 'enterprise' ? value : 'free';
}

function toMembershipMap(
  memberships: OrganizationMembershipSummary[],
): Map<number, OrganizationMembershipSummary> {
  const map = new Map<number, OrganizationMembershipSummary>();
  for (const membership of memberships) {
    map.set(membership.organizationId, membership);
  }
  return map;
}

export async function resolveBillingOrganizationContext(
  payload: Payload,
  user: AuthenticatedUser,
  requestedOrganizationId?: number | null,
): Promise<{
  activeOrganizationId: number;
  activeOrganization: BillingOrganizationSnapshot;
  memberships: BillingOrganizationSnapshot[];
}> {
  const context = await resolveOrganizationFromInput(
    payload,
    user,
    requestedOrganizationId ?? undefined,
    {
      strictRequestedMembership: requestedOrganizationId != null,
    },
  );

  const membershipMap = toMembershipMap(context.memberships);
  const orgIds = context.memberships.map((entry) => entry.organizationId);

  const organizationsResult = await payload.find({
    collection: 'organizations',
    where: {
      id: {
        in: orgIds,
      },
    },
    depth: 0,
    limit: 500,
    overrideAccess: true,
  });

  const organizationDocs = new Map<number, Record<string, unknown>>();
  for (const doc of organizationsResult.docs as Array<Record<string, unknown>>) {
    const id = asNumericId(doc.id);
    if (id != null) {
      organizationDocs.set(id, doc);
    }
  }

  const memberships: BillingOrganizationSnapshot[] = context.memberships.map((membership) => {
    const organizationDoc = organizationDocs.get(membership.organizationId);
    return {
      organizationId: membership.organizationId,
      organizationName: membership.organizationName,
      organizationSlug: membership.organizationSlug,
      role: membership.role,
      stripeConnectAccountId:
        (organizationDoc?.stripeConnectAccountId as string | null | undefined) ??
        membership.stripeConnectAccountId ??
        null,
      stripeConnectOnboardingComplete:
        (organizationDoc?.stripeConnectOnboardingComplete as boolean | null | undefined) ??
        membership.stripeConnectOnboardingComplete ??
        false,
      planTier: toPlanTier(organizationDoc?.planTier),
      storageQuotaBytes: Math.max(
        0,
        Math.round(
          toFiniteNumber(organizationDoc?.storageQuotaBytes, DEFAULT_STORAGE_QUOTA_BYTES),
        ),
      ),
      storageUsedBytes: Math.max(
        0,
        Math.round(toFiniteNumber(organizationDoc?.storageUsedBytes, 0)),
      ),
      storageWarningThresholdPercent: Math.min(
        100,
        Math.max(
          1,
          Math.round(
            toFiniteNumber(
              organizationDoc?.storageWarningThresholdPercent,
              DEFAULT_STORAGE_WARNING_THRESHOLD_PERCENT,
            ),
          ),
        ),
      ),
      enterpriseSourceAccess: Boolean(organizationDoc?.enterpriseSourceAccess),
      enterprisePremiumSupport: Boolean(organizationDoc?.enterprisePremiumSupport),
      enterpriseCustomEditors: Boolean(organizationDoc?.enterpriseCustomEditors),
      stripeCustomerId:
        (organizationDoc?.stripeCustomerId as string | null | undefined) ?? null,
    };
  });

  const activeMembership = membershipMap.get(context.activeOrganizationId);
  const activeOrganization = memberships.find(
    (entry) => entry.organizationId === context.activeOrganizationId,
  );

  if (!activeMembership || !activeOrganization) {
    throw new Error('Unable to resolve active organization billing context.');
  }

  return {
    activeOrganizationId: context.activeOrganizationId,
    activeOrganization,
    memberships,
  };
}

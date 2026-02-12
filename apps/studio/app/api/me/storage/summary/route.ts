import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
} from '@/lib/server/organizations';
import { resolveBillingOrganizationContext } from '@/lib/server/billing/context';

function toStorageSummary(input: {
  organizationId: number;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  storageWarningThresholdPercent: number;
}) {
  const storageQuotaBytes = Math.max(0, Math.round(input.storageQuotaBytes));
  const storageUsedBytes = Math.max(0, Math.round(input.storageUsedBytes));
  const storageRemainingBytes = Math.max(0, storageQuotaBytes - storageUsedBytes);
  const storageUsagePercent =
    storageQuotaBytes > 0 ? (storageUsedBytes / storageQuotaBytes) * 100 : 0;
  const warning = storageUsagePercent >= input.storageWarningThresholdPercent;
  const overLimit = storageQuotaBytes > 0 && storageUsedBytes > storageQuotaBytes;

  return {
    organizationId: input.organizationId,
    storageQuotaBytes,
    storageUsedBytes,
    storageRemainingBytes,
    storageUsagePercent,
    storageWarningThresholdPercent: input.storageWarningThresholdPercent,
    warning,
    overLimit,
  };
}

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);
    const billingContext = await resolveBillingOrganizationContext(
      payload,
      user,
      requestedOrgId,
    );
    const activeOrganization = billingContext.activeOrganization;

    return NextResponse.json({
      activeOrganizationId: billingContext.activeOrganizationId,
      planTier: activeOrganization.planTier,
      summary: toStorageSummary({
        organizationId: activeOrganization.organizationId,
        storageQuotaBytes: activeOrganization.storageQuotaBytes,
        storageUsedBytes: activeOrganization.storageUsedBytes,
        storageWarningThresholdPercent:
          activeOrganization.storageWarningThresholdPercent,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load storage summary.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

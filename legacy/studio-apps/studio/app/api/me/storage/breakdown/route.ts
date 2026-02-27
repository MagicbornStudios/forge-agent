import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
} from '@/lib/server/organizations';
import { resolveBillingOrganizationContext } from '@/lib/server/billing/context';
import { getOrganizationStorageBreakdown } from '@/lib/server/storage-metering';

type GroupBy = 'org' | 'user' | 'project';

function parseGroupBy(value: string | null): GroupBy {
  if (value === 'org' || value === 'user') return value;
  return 'project';
}

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const groupBy = parseGroupBy(url.searchParams.get('groupBy'));
    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);
    const billingContext = await resolveBillingOrganizationContext(
      payload,
      user,
      requestedOrgId,
    );

    const rows = await getOrganizationStorageBreakdown(
      payload,
      billingContext.activeOrganizationId,
      groupBy,
    );

    return NextResponse.json({
      activeOrganizationId: billingContext.activeOrganizationId,
      groupBy,
      rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load storage breakdown.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

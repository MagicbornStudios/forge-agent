import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
} from '@/lib/server/organizations';
import { resolveBillingOrganizationContext } from '@/lib/server/billing/context';

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestedOrgId = parseOrganizationIdFromRequestUrl(req);
    const context = await resolveBillingOrganizationContext(
      payload,
      user,
      requestedOrgId,
    );

    return NextResponse.json({
      activeOrganizationId: context.activeOrganizationId,
      activeOrganization: context.activeOrganization,
      memberships: context.memberships,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load organizations.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

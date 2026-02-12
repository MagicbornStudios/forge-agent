import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  requireAuthenticatedUser,
} from '@/lib/server/organizations';
import { resolveBillingOrganizationContext } from '@/lib/server/billing/context';

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const organizationId =
      typeof body?.organizationId === 'number'
        ? body.organizationId
        : typeof body?.organizationId === 'string'
          ? Number(body.organizationId)
          : NaN;
    if (!Number.isFinite(organizationId) || organizationId <= 0) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 },
      );
    }

    const context = await resolveBillingOrganizationContext(payload, user, organizationId);

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        defaultOrganization: organizationId,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      activeOrganizationId: organizationId,
      activeOrganization:
        context.memberships.find((entry) => entry.organizationId === organizationId) ?? null,
      memberships: context.memberships,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update active organization.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

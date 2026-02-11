import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import {
  ensureOrganizationContext,
  requireAuthenticatedUser,
} from '@/lib/server/organizations';

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = await ensureOrganizationContext(payload, user);
    const activeOrganization =
      context.memberships.find(
        (membership) => membership.organizationId === context.activeOrganizationId,
      ) ?? null;

    return NextResponse.json({
      activeOrganizationId: context.activeOrganizationId,
      activeOrganization,
      memberships: context.memberships,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load organizations.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { ensureOrganizationContext } from '@/lib/server/organizations';

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current user (auth)
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: User object or null
 *       401:
 *         description: Not authenticated (body has user null)
 *       500:
 *         description: Server error
 */
export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const result = await payload.auth({
      headers: req.headers,
      canSetHeaders: false,
    });

    if (!result.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = result.user as {
      id: string | number;
      email?: string | null;
      name?: string | null;
      role?: string | null;
      plan?: string | null;
      defaultOrganization?: number | { id: number } | null;
      stripeConnectAccountId?: string | null;
    };
    const typedUser =
      typeof user.id === 'number'
        ? (user as {
            id: number;
            email?: string | null;
            name?: string | null;
            role?: string | null;
            plan?: string | null;
            defaultOrganization?: number | { id: number } | null;
            stripeConnectAccountId?: string | null;
          })
        : null;
    const orgContext =
      typedUser != null ? await ensureOrganizationContext(payload, typedUser) : null;
    const activeMembership =
      orgContext?.memberships.find(
        (membership) => membership.organizationId === orgContext.activeOrganizationId,
      ) ?? null;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? null,
        role: user.role ?? null,
        plan: user.plan ?? null,
        defaultOrganizationId: orgContext?.activeOrganizationId ?? null,
        stripeConnectAccountId:
          activeMembership?.stripeConnectAccountId ?? user.stripeConnectAccountId ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load user.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

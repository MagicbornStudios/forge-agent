import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';
import {
  requireStripePriceIdPro,
  requireStripeSecretKey,
  resolvePublicAppUrl,
} from '@/lib/env';

export async function POST(req: Request) {
  let stripeSecretKey: string;
  let priceId: string;
  try {
    stripeSecretKey = requireStripeSecretKey();
    priceId = requireStripePriceIdPro();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stripe is not configured' },
      { status: 503 }
    );
  }
  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = (await req.json().catch(() => ({}))) as {
      successUrl?: unknown;
      cancelUrl?: unknown;
      orgId?: unknown;
      organizationId?: unknown;
    };
    const orgFromBody =
      typeof body.organizationId === 'number'
        ? body.organizationId
        : typeof body.organizationId === 'string'
          ? Number(body.organizationId)
          : typeof body.orgId === 'number'
            ? body.orgId
            : typeof body.orgId === 'string'
              ? Number(body.orgId)
              : null;
    const orgFromUrl = parseOrganizationIdFromRequestUrl(req);
    const requestedOrgId =
      orgFromBody != null && Number.isFinite(orgFromBody) && orgFromBody > 0
        ? orgFromBody
        : orgFromUrl;
    const orgContext = await resolveOrganizationFromInput(
      payload,
      user,
      requestedOrgId ?? undefined,
      { strictRequestedMembership: requestedOrgId != null },
    );
    const organization = await payload.findByID({
      collection: 'organizations',
      id: orgContext.activeOrganizationId,
      depth: 0,
      overrideAccess: true,
    });
    const fallbackBaseUrl = resolvePublicAppUrl('http://localhost:3000');
    const successUrl =
      typeof body?.successUrl === 'string'
        ? body.successUrl
        : `${fallbackBaseUrl}/billing?success=1`;
    const cancelUrl =
      typeof body?.cancelUrl === 'string'
        ? body.cancelUrl
        : `${fallbackBaseUrl}/billing`;
    const stripe = new Stripe(stripeSecretKey, {});
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer:
        typeof organization?.stripeCustomerId === 'string' &&
        organization.stripeCustomerId.length > 0
          ? organization.stripeCustomerId
          : undefined,
      client_reference_id: String(user.id),
      metadata: {
        kind: 'plan_upgrade',
        userId: String(user.id),
        orgId: String(orgContext.activeOrganizationId),
      },
    });
    return NextResponse.json({
      url: session.url ?? undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

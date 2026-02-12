import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
} from '@/lib/server/organizations';
import { resolveBillingOrganizationContext } from '@/lib/server/billing/context';
import {
  getStorageAddonBytesDefault,
  requireStripePriceIdStorageAddon,
  requireStripeSecretKey,
  resolvePublicAppUrl,
} from '@/lib/env';

function parseBodyOrganizationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export async function POST(req: Request) {
  let stripeSecretKey: string;
  let storageAddonPriceId: string;
  try {
    stripeSecretKey = requireStripeSecretKey();
    storageAddonPriceId = requireStripePriceIdStorageAddon();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Stripe storage add-on is not configured',
      },
      { status: 503 },
    );
  }

  const defaultStorageAddonBytes = getStorageAddonBytesDefault();

  try {
    const payload = await getPayload({ config });
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      orgId?: unknown;
      organizationId?: unknown;
      successUrl?: unknown;
      cancelUrl?: unknown;
    };
    const requestedFromBody =
      parseBodyOrganizationId(body.organizationId) ?? parseBodyOrganizationId(body.orgId);
    const requestedFromUrl = parseOrganizationIdFromRequestUrl(req);
    const requestedOrgId = requestedFromBody ?? requestedFromUrl;

    const billingContext = await resolveBillingOrganizationContext(
      payload,
      user,
      requestedOrgId,
    );
    const activeOrg = billingContext.activeOrganization;

    const origin = resolvePublicAppUrl('http://localhost:3001');

    const successUrl =
      typeof body.successUrl === 'string' && body.successUrl.trim().length > 0
        ? body.successUrl
        : `${origin}/dashboard/billing?storage=success`;
    const cancelUrl =
      typeof body.cancelUrl === 'string' && body.cancelUrl.trim().length > 0
        ? body.cancelUrl
        : `${origin}/dashboard/billing?storage=cancel`;

    const stripe = new Stripe(stripeSecretKey, {});
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: storageAddonPriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: activeOrg.stripeCustomerId ?? undefined,
      metadata: {
        kind: 'storage_upgrade',
        orgId: String(activeOrg.organizationId),
        userId: String(user.id),
        storageBytes: String(defaultStorageAddonBytes),
      },
      client_reference_id: String(user.id),
    });

    return NextResponse.json({
      activeOrganizationId: activeOrg.organizationId,
      url: session.url ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create storage upgrade checkout session.';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

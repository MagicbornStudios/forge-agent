import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

/** Platform take: 10% of listing price (TBD in business docs). */
const PLATFORM_FEE_PERCENT = 0.1;

export async function POST(req: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({
      headers: req.headers,
      canSetHeaders: false,
    });
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const listingId =
      typeof body?.listingId === 'number'
        ? body.listingId
        : typeof body?.listingId === 'string'
          ? parseInt(body.listingId, 10)
          : undefined;
    if (listingId == null || Number.isNaN(listingId)) {
      return NextResponse.json(
        { error: 'listingId is required' },
        { status: 400 }
      );
    }
    const listing = await payload.findByID({
      collection: 'listings',
      id: listingId,
      depth: 1,
    });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (listing.status !== 'published') {
      return NextResponse.json(
        { error: 'Listing is not available for purchase' },
        { status: 400 }
      );
    }
    if (!listing.price || listing.price <= 0) {
      return NextResponse.json(
        { error: 'Listing has no price' },
        { status: 400 }
      );
    }
    const creator =
      typeof listing.creator === 'object' && listing.creator != null
        ? listing.creator
        : await payload.findByID({
            collection: 'users',
            id: listing.creator as number,
          });
    const creatorAccountId =
      typeof creator === 'object' && creator != null && 'stripeConnectAccountId' in creator
        ? (creator as { stripeConnectAccountId?: string | null }).stripeConnectAccountId
        : null;
    if (!creatorAccountId) {
      return NextResponse.json(
        { error: 'Creator has not set up payouts' },
        { status: 400 }
      );
    }
    const base =
      typeof body?.baseUrl === 'string' && body.baseUrl
        ? body.baseUrl
        : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const successUrl =
      typeof body?.successUrl === 'string' && body.successUrl
        ? body.successUrl
        : `${base}/?checkout=success`;
    const cancelUrl =
      typeof body?.cancelUrl === 'string' && body.cancelUrl
        ? body.cancelUrl
        : `${base}/?checkout=cancelled`;
    const applicationFeeAmount = Math.round(listing.price * PLATFORM_FEE_PERCENT);
    const stripe = new Stripe(stripeSecretKey, {});
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: (listing.currency ?? 'usd').toLowerCase(),
            unit_amount: listing.price,
            product_data: {
              name: listing.title ?? 'Clone',
              description:
                typeof listing.description === 'string'
                  ? listing.description.slice(0, 500)
                  : undefined,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: creatorAccountId },
        metadata: {
          listingId: String(listing.id),
          buyerId: String(user.id),
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(user.id),
      metadata: {
        listingId: String(listing.id),
        buyerId: String(user.id),
      },
    });
    return NextResponse.json({ url: session.url ?? undefined });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

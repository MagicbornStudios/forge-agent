import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID_PRO;

export async function POST(req: Request) {
  if (!stripeSecretKey || !priceId) {
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
    const successUrl =
      typeof body?.successUrl === 'string'
        ? body.successUrl
        : `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/billing?success=1`;
    const cancelUrl =
      typeof body?.cancelUrl === 'string'
        ? body.cancelUrl
        : `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/billing`;
    const stripe = new Stripe(stripeSecretKey, {});
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: String(user.id),
      metadata: { userId: String(user.id) },
    });
    return NextResponse.json({
      url: session.url ?? undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

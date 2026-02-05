import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured' },
      { status: 503 }
    );
  }
  try {
    const raw = await req.text();
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }
    const stripe = new Stripe(stripeSecretKey, {});
    const event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
    if (event.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true });
    }
    const session = event.data.object as Stripe.Checkout.Session;
    const userId =
      session.client_reference_id ?? session.metadata?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'No user reference in session' }, { status: 400 });
    }
    const payload = await getPayload({ config });
    await payload.update({
      collection: 'users',
      id: Number(userId),
      data: { plan: 'pro' },
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

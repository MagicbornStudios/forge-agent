import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

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
    const existing = user.stripeConnectAccountId;
    if (existing) {
      return NextResponse.json({ accountId: existing });
    }
    const email = 'email' in user ? String(user.email) : undefined;
    if (!email) {
      return NextResponse.json(
        { error: 'User email is required for Connect' },
        { status: 400 }
      );
    }
    const stripe = new Stripe(stripeSecretKey, {});
    const account = await stripe.accounts.create({
      type: 'express',
      email,
    });
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { stripeConnectAccountId: account.id },
    });
    return NextResponse.json({ accountId: account.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create Connect account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

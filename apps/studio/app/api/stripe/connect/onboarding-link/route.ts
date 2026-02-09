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
    const accountId = user.stripeConnectAccountId;
    if (!accountId) {
      return NextResponse.json(
        { error: 'Complete Connect account setup first' },
        { status: 400 }
      );
    }
    const body = await req.json().catch(() => ({}));
    const base =
      typeof body?.baseUrl === 'string' && body.baseUrl
        ? body.baseUrl
        : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const returnUrl =
      typeof body?.returnUrl === 'string' && body.returnUrl
        ? body.returnUrl
        : `${base}/?connect=success`;
    const refreshUrl =
      typeof body?.refreshUrl === 'string' && body.refreshUrl
        ? body.refreshUrl
        : `${base}/?connect=refresh`;
    const stripe = new Stripe(stripeSecretKey, {});
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    return NextResponse.json({ url: link.url });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create onboarding link';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

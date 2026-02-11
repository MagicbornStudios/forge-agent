import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';

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
    const user = await requireAuthenticatedUser(payload, req.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const parsedOrgIdFromBody =
      typeof body?.orgId === 'number'
        ? body.orgId
        : typeof body?.orgId === 'string'
          ? Number(body.orgId)
          : null;
    const parsedOrgIdFromUrl = parseOrganizationIdFromRequestUrl(req);
    const requestedOrgId =
      parsedOrgIdFromBody && Number.isFinite(parsedOrgIdFromBody)
        ? parsedOrgIdFromBody
        : parsedOrgIdFromUrl;
    const context = await resolveOrganizationFromInput(
      payload,
      user,
      requestedOrgId ?? undefined,
      { strictRequestedMembership: true },
    );
    const activeOrgId = context.activeOrganizationId;
    const organization = await payload.findByID({
      collection: 'organizations',
      id: activeOrgId,
      depth: 0,
    });

    const existing = organization?.stripeConnectAccountId ?? user.stripeConnectAccountId;
    if (existing) {
      return NextResponse.json({ accountId: existing, organizationId: activeOrgId });
    }
    const email =
      typeof user.email === 'string' && user.email.length > 0
        ? user.email
        : undefined;
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
      collection: 'organizations',
      id: activeOrgId,
      data: {
        stripeConnectAccountId: account.id,
        stripeConnectOnboardingComplete: false,
      },
      overrideAccess: true,
    });
    if (!user.stripeConnectAccountId) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { stripeConnectAccountId: account.id },
        overrideAccess: true,
      });
    }
    return NextResponse.json({ accountId: account.id, organizationId: activeOrgId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create Connect account';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

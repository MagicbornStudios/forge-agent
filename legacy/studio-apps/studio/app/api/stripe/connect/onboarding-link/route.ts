import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';
import {
  parseOrganizationIdFromRequestUrl,
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
} from '@/lib/server/organizations';
import { requireStripeSecretKey, resolvePublicAppUrl } from '@/lib/env';

export async function POST(req: Request) {
  let stripeSecretKey: string;
  try {
    stripeSecretKey = requireStripeSecretKey();
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

    const accountId = organization?.stripeConnectAccountId ?? null;
    if (!accountId) {
      return NextResponse.json(
        { error: 'Complete Connect account setup first' },
        { status: 400 }
      );
    }
    const fallbackBaseUrl = resolvePublicAppUrl('http://localhost:3000');
    const base =
      typeof body?.baseUrl === 'string' && body.baseUrl
        ? body.baseUrl
        : fallbackBaseUrl;
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
    return NextResponse.json({ url: link.url, organizationId: activeOrgId });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create onboarding link';
    const status = message.includes('Not a member') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

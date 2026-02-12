import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';
import { cloneProjectToUser } from '@/lib/clone/clone-project-to-user';
import {
  getStorageAddonBytesDefault,
  requireStripeSecretKey,
  requireStripeWebhookSecret,
} from '@/lib/env';

function asNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumericId((value as { id?: unknown }).id);
  }
  return null;
}

async function findLicenseBySessionId(payload: Awaited<ReturnType<typeof getPayload>>, sessionId: string) {
  const existing = await payload.find({
    collection: 'licenses',
    where: {
      stripeSessionId: {
        equals: sessionId,
      },
    },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  });
  return existing.docs[0] ?? null;
}

async function ensureStorageUpgradeApplied(
  payload: Awaited<ReturnType<typeof getPayload>>,
  session: Stripe.Checkout.Session,
  sessionId: string,
) {
  const orgId = asNumericId(session.metadata?.orgId);
  if (orgId == null) return;

  const organization = await payload.findByID({
    collection: 'organizations',
    id: orgId,
    depth: 0,
    overrideAccess: true,
  });
  if (!organization) return;

  const lastSessionId =
    typeof organization.lastStorageUpgradeSessionId === 'string'
      ? organization.lastStorageUpgradeSessionId
      : null;
  if (lastSessionId === sessionId) {
    return;
  }

  const currentQuota =
    typeof organization.storageQuotaBytes === 'number' && Number.isFinite(organization.storageQuotaBytes)
      ? Math.max(0, Math.round(organization.storageQuotaBytes))
      : 0;
  const metadataBytes = Number(session.metadata?.storageBytes ?? NaN);
  const storageBytesToAdd =
    Number.isFinite(metadataBytes) && metadataBytes > 0
      ? Math.round(metadataBytes)
      : defaultStorageAddonBytes;

  await payload.update({
    collection: 'organizations',
    id: orgId,
    data: {
      storageQuotaBytes: currentQuota + storageBytesToAdd,
      stripeCustomerId:
        typeof session.customer === 'string' && session.customer.length > 0
          ? session.customer
          : organization.stripeCustomerId ?? undefined,
      lastStorageUpgradeSessionId: sessionId,
    },
    overrideAccess: true,
  });
}

async function ensureListingLicenseProcessed(
  payload: Awaited<ReturnType<typeof getPayload>>,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  sessionId: string,
) {
  const listingId = asNumericId(session.metadata?.listingId);
  const buyerId = asNumericId(session.metadata?.buyerId);
  if (listingId == null || buyerId == null) return;

  const listing = await payload.findByID({
    collection: 'listings',
    id: listingId,
    depth: 1,
    overrideAccess: true,
  });
  if (!listing) return;

  const projectId =
    listing.project != null
      ? typeof listing.project === 'object' && listing.project != null
        ? (listing.project as { id: number }).id
        : Number(listing.project)
      : null;
  const cloneMode =
    listing && 'cloneMode' in listing ? (listing as { cloneMode?: string }).cloneMode : undefined;
  const versionSnapshotId =
    cloneMode === 'version-only' && projectId != null ? String(projectId) : undefined;
  const sellerOrganizationFromMetadata = asNumericId(session.metadata?.sellerOrganizationId);
  const sellerOrganizationId =
    sellerOrganizationFromMetadata ??
    (listing.organization != null
      ? typeof listing.organization === 'object' && listing.organization != null
        ? Number((listing.organization as { id: number }).id)
        : Number(listing.organization)
      : null);

  let license = await findLicenseBySessionId(payload, sessionId);
  if (!license) {
    try {
      license = await payload.create({
        collection: 'licenses',
        data: {
          user: buyerId,
          listing: listingId,
          stripeSessionId: sessionId,
          grantedAt: new Date().toISOString(),
          ...(sellerOrganizationId != null && Number.isFinite(sellerOrganizationId)
            ? { sellerOrganization: sellerOrganizationId }
            : {}),
          ...(versionSnapshotId != null ? { versionSnapshotId } : {}),
        },
        overrideAccess: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isDuplicate = message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('unique');
      if (!isDuplicate) throw error;
      license = await findLicenseBySessionId(payload, sessionId);
    }
  }

  if (!license) return;

  let amountCents: number | undefined;
  let platformFeeCents: number | undefined;
  try {
    const expandedSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    if (typeof expandedSession.amount_total === 'number') {
      amountCents = expandedSession.amount_total;
    }
    const paymentIntent = expandedSession.payment_intent as Stripe.PaymentIntent | null | undefined;
    if (
      paymentIntent &&
      typeof (paymentIntent as { application_fee_amount?: number }).application_fee_amount === 'number'
    ) {
      platformFeeCents = (paymentIntent as { application_fee_amount: number }).application_fee_amount;
    }
  } catch {
    // leave amount/fee unset when Stripe expansion fails
  }

  if (amountCents != null || platformFeeCents != null) {
    await payload.update({
      collection: 'licenses',
      id: license.id as number,
      data: {
        ...(amountCents != null ? { amountCents } : {}),
        ...(platformFeeCents != null ? { platformFeeCents } : {}),
      },
      overrideAccess: true,
    });
  }

  const clonedProjectId = asNumericId((license as { clonedProjectId?: unknown }).clonedProjectId);
  if (projectId != null && clonedProjectId == null) {
    try {
      const newProjectId = await cloneProjectToUser(payload, projectId, buyerId);
      await payload.update({
        collection: 'licenses',
        id: license.id as number,
        data: { clonedProjectId: newProjectId },
        overrideAccess: true,
      });
    } catch (cloneError) {
      console.error('Webhook: first clone failed', cloneError);
    }
  }
}

export async function POST(req: Request) {
  let stripeSecretKey: string;
  let webhookSecret: string;
  try {
    stripeSecretKey = requireStripeSecretKey();
    webhookSecret = requireStripeWebhookSecret();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Stripe webhook is not configured',
      },
      { status: 503 }
    );
  }

  const defaultStorageAddonBytes = getStorageAddonBytesDefault();
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
    const payload = await getPayload({ config });
    const sessionId = session.id ?? '';
    if (!sessionId) {
      return NextResponse.json({ error: 'No session id' }, { status: 400 });
    }

    await ensureListingLicenseProcessed(payload, stripe, session, sessionId);

    if (session.metadata?.kind === 'storage_upgrade') {
      await ensureStorageUpgradeApplied(payload, session, sessionId);
      return NextResponse.json({ received: true });
    }

    const userId =
      session.client_reference_id ?? session.metadata?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'No user reference in session' }, { status: 400 });
    }
    const organizationId = asNumericId(session.metadata?.orgId);
    if (organizationId != null) {
      const organization = await payload.findByID({
        collection: 'organizations',
        id: organizationId,
        depth: 0,
        overrideAccess: true,
      });
      if (organization) {
        await payload.update({
          collection: 'organizations',
          id: organizationId,
          data: {
            planTier: 'pro',
            stripeCustomerId:
              typeof session.customer === 'string' && session.customer.length > 0
                ? session.customer
                : organization.stripeCustomerId ?? undefined,
          },
          overrideAccess: true,
        });
      }
    }
    await payload.update({
      collection: 'users',
      id: Number(userId),
      data: { plan: 'pro' },
      overrideAccess: true,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';
import { cloneProjectToUser } from '@/lib/clone/clone-project-to-user';

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
    const payload = await getPayload({ config });
    const listingId = session.metadata?.listingId;
    const buyerId = session.metadata?.buyerId;
    if (listingId != null && listingId !== '' && buyerId != null && buyerId !== '') {
      const sessionId = session.id ?? '';
      if (!sessionId) {
        return NextResponse.json({ error: 'No session id' }, { status: 400 });
      }
      const license = await payload.create({
        collection: 'licenses',
        data: {
          user: Number(buyerId),
          listing: Number(listingId),
          stripeSessionId: sessionId,
          grantedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      });
      const listing = await payload.findByID({
        collection: 'listings',
        id: Number(listingId),
        depth: 1,
      });
      const projectId =
        listing?.project != null
          ? typeof listing.project === 'object' && listing.project != null
            ? (listing.project as { id: number }).id
            : Number(listing.project)
          : null;
      if (projectId != null) {
        try {
          const newProjectId = await cloneProjectToUser(
            payload,
            projectId,
            Number(buyerId)
          );
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
      return NextResponse.json({ received: true });
    }
    const userId =
      session.client_reference_id ?? session.metadata?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'No user reference in session' }, { status: 400 });
    }
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

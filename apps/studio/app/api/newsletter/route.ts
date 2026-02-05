import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

async function sendWelcomeEmail(to: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL ?? 'Forge <onboarding@resend.dev>';
  if (!apiKey) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'You’re subscribed to Forge',
      html: '<p>Thanks for subscribing. We’ll send product updates and tips.</p>',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to send welcome email');
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : null;
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    const payload = await getPayload({ config });
    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        email,
        optedIn: typeof body?.optedIn === 'boolean' ? body.optedIn : true,
        source: typeof body?.source === 'string' ? body.source.trim() : undefined,
      },
    });
    if (process.env.RESEND_API_KEY) {
      try {
        await sendWelcomeEmail(email);
      } catch {
        // Log but do not fail the request
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to subscribe.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

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
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to subscribe.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

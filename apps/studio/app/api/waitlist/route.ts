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
      collection: 'waitlist',
      data: {
        email,
        name: typeof body?.name === 'string' ? body.name.trim() : undefined,
        source: typeof body?.source === 'string' ? body.source.trim() : undefined,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join waitlist.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

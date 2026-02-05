import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'promotions',
      where: { active: { equals: true } },
      sort: '-startsAt',
      limit: 20,
    });
    const now = new Date();
    const promotions = result.docs
      .filter((doc) => {
        const start = doc.startsAt ? new Date(doc.startsAt) : null;
        const end = doc.endsAt ? new Date(doc.endsAt) : null;
        if (start && start > now) return false;
        if (end && end < now) return false;
        return true;
      })
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        body: doc.body,
        ctaUrl: doc.ctaUrl ?? undefined,
      }));
    return NextResponse.json({ promotions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load promotions.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

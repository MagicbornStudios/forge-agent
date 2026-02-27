import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(req: Request) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({
      headers: req.headers,
      canSetHeaders: false,
    });
    if (!user || typeof user.id !== 'number') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId?.trim()) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }
    const result = await payload.find({
      collection: 'licenses',
      where: {
        and: [
          { stripeSessionId: { equals: sessionId.trim() } },
          { user: { equals: user.id } },
        ],
      },
      depth: 1,
      limit: 1,
    });
    const license = result.docs[0];
    if (!license) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const listing =
      license.listing != null
        ? typeof license.listing === 'object'
          ? license.listing
          : await payload.findByID({
              collection: 'listings',
              id: license.listing as number,
              depth: 0,
            })
        : null;
    const listingTitle =
      listing != null && typeof listing === 'object' && 'title' in listing
        ? (listing.title as string) ?? null
        : null;
    const listingId =
      license.listing != null
        ? typeof license.listing === 'object'
          ? (license.listing as { id: number }).id
          : Number(license.listing)
        : 0;
    const clonedProjectId =
      license.clonedProjectId != null
        ? typeof license.clonedProjectId === 'object'
          ? (license.clonedProjectId as { id: number }).id
          : Number(license.clonedProjectId)
        : null;

    return NextResponse.json({
      clonedProjectId,
      listingTitle,
      listingId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Session result failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

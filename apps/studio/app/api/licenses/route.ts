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
    const result = await payload.find({
      collection: 'licenses',
      where: { user: { equals: user.id } },
      depth: 1,
      limit: 100,
      sort: '-grantedAt',
    });
    const licenses = result.docs.map((license) => {
      const listing =
        typeof license.listing === 'object' && license.listing != null
          ? license.listing
          : null;
      const listingTitle =
        listing != null && typeof listing === 'object' && 'title' in listing
          ? (listing.title as string) ?? null
          : null;
      const clonedProjectId =
        license.clonedProjectId != null
          ? typeof license.clonedProjectId === 'object'
            ? (license.clonedProjectId as { id: number }).id
            : Number(license.clonedProjectId)
          : null;
      return {
        id: license.id,
        listingTitle,
        grantedAt: license.grantedAt,
        clonedProjectId,
      };
    });
    return NextResponse.json({ licenses });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to list licenses';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * Public catalog: published listings only. Marketing site calls this.
 * Payload REST handles /api/listings (create/update/delete) with auth.
 */
export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    const result = await payload.find({
      collection: 'listings',
      where: slug
        ? { status: { equals: 'published' }, slug: { equals: slug } }
        : { status: { equals: 'published' } },
      sort: '-updatedAt',
      limit: slug ? 1 : 100,
      depth: 1,
    });

    const docs = result.docs;
    const listings = docs.map((doc) => {
      const creator = doc.creator;
      const creatorName =
        typeof creator === 'object' && creator !== null && 'name' in creator
          ? (creator as { name?: string }).name
          : undefined;
      const thumb = doc.thumbnail;
      const thumbnailUrl =
        typeof thumb === 'object' && thumb !== null && 'url' in thumb
          ? (thumb as { url?: string }).url ?? undefined
          : undefined;
      return {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description ?? undefined,
        listingType: doc.listingType,
        cloneMode: doc.cloneMode ?? 'indefinite',
        price: doc.price,
        currency: doc.currency ?? 'USD',
        category: doc.category ?? undefined,
        playUrl: doc.playUrl ?? undefined,
        updatedAt: doc.updatedAt ?? undefined,
        thumbnailUrl,
        creatorName,
      };
    });

    if (slug && listings.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (slug && listings.length === 1) {
      return NextResponse.json({ listing: listings[0] });
    }
    return NextResponse.json({ listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load listings.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

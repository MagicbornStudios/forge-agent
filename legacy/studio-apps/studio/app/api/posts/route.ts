import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const result = await payload.find({
        collection: 'posts',
        where: {
          and: [
            { status: { equals: 'published' } },
            { slug: { equals: slug } },
          ],
        },
        limit: 1,
      });
      const post = result.docs[0];
      if (!post) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? undefined,
          body: post.body,
          publishedAt: post.publishedAt ?? undefined,
        },
      });
    }

    const result = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 50,
    });
    const posts = result.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt ?? undefined,
      publishedAt: doc.publishedAt ?? undefined,
    }));
    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load posts.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

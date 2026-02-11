import Link from 'next/link';
import { fetchPosts } from '@/lib/api/studio';

export default async function BlogListPage() {
  const posts = await fetchPosts();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={String(post.id)}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <h2 className="font-semibold text-foreground">{post.title}</h2>
                {post.publishedAt ? (
                  <time dateTime={post.publishedAt} className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                ) : null}
                {post.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

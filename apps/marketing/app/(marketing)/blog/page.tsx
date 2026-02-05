import Link from 'next/link';
import { fetchPosts } from '@/lib/api';

export default async function BlogListPage() {
  const posts = await fetchPosts();

  return (
    <div className="min-w-0 flex-1 p-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Blog</h1>
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
                {post.publishedAt && (
                  <time
                    dateTime={post.publishedAt}
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                )}
                {post.excerpt && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

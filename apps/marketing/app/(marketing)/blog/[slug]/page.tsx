import { notFound } from 'next/navigation';
import { fetchPostBySlug } from '@/lib/api';
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) notFound();

  const bodyHtml =
    post.body && typeof post.body === 'object' && 'root' in post.body
      ? convertLexicalToHTML({ data: post.body as { root: unknown } })
      : '';

  return (
    <div className="min-w-0 flex-1 p-8">
      <article className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
          {post.publishedAt && (
            <time
              dateTime={post.publishedAt}
              className="text-sm text-muted-foreground"
            >
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          )}
        </header>
        {post.excerpt && (
          <p className="mb-6 text-muted-foreground">{post.excerpt}</p>
        )}
        {bodyHtml ? (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline [&_a:hover]:no-underline"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
      </article>
    </div>
  );
}

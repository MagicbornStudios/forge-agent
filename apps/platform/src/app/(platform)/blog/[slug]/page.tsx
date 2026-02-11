import { notFound } from 'next/navigation';
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html';
import { fetchPostBySlug } from '@/lib/api/studio';

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
      ? convertLexicalToHTML({ data: post.body as any })
      : '';

  return (
    <div className="mx-auto w-full max-w-3xl py-4">
      <article>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{post.title}</h1>
          {post.publishedAt ? (
            <time dateTime={post.publishedAt} className="text-sm text-muted-foreground">
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          ) : null}
        </header>
        {post.excerpt ? <p className="mb-6 text-muted-foreground">{post.excerpt}</p> : null}
        {bodyHtml ? (
          <div
            className="prose prose-neutral max-w-none dark:prose-invert [&_a]:text-primary [&_a:hover]:underline"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
      </article>
    </div>
  );
}

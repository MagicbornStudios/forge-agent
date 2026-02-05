import { readFile } from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOC_ENTRIES, type DocSlug } from '@/content/docs/docs-config';

const VALID_SLUGS = new Set(DOC_ENTRIES.map((e) => e.slug));

async function getMarkdown(slug: string): Promise<string | null> {
  if (!VALID_SLUGS.has(slug as DocSlug)) return null;
  const base = slug === 'index' ? 'index' : slug;
  const filePath = path.join(process.cwd(), 'content', 'docs', `${base}.md`);
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug: slugSegments } = await params;
  const slug =
    slugSegments && slugSegments.length > 0 ? slugSegments[0]! : 'index';

  const content = await getMarkdown(slug);
  if (content == null) notFound();

  let body = content;
  if (body.startsWith('---')) {
    const end = body.indexOf('\n---', 3);
    if (end !== -1) body = body.slice(end + 4);
  }

  return (
    <article className="doc-content max-w-3xl text-foreground [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_a]:hover:no-underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => {
            const { href, children } = props as { href?: string; children?: React.ReactNode };
            if (href?.startsWith('http')) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            }
            return (
              <Link href={href ?? '#'}>{children}</Link>
            );
          },
          code: ({ className, children, ...props }) => {
            const isBlock = className != null;
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}

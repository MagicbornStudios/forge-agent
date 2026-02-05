import { readFile } from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DOC_ENTRIES, type DocSlug } from '../docs-config';

const VALID_SLUGS = new Set(DOC_ENTRIES.map((e) => e.slug));

const REPO_ROOT = path.join(process.cwd(), '..', '..');

function getDocPaths(slug: string): string[] {
  if (slug === '00-docs-index') {
    const base = path.join(REPO_ROOT, 'docs', slug);
    return [`${base}.mdx`, `${base}.md`];
  }
  const base = path.join(REPO_ROOT, 'docs', 'how-to', slug);
  return [`${base}.mdx`, `${base}.md`];
}

async function getMarkdown(slug: string): Promise<string | null> {
  if (!VALID_SLUGS.has(slug as DocSlug)) return null;
  try {
    const candidates = getDocPaths(slug);
    for (const filePath of candidates) {
      try {
        return await readFile(filePath, 'utf-8');
      } catch {
        // keep trying
      }
    }
    return null;
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
    slugSegments && slugSegments.length > 0 ? slugSegments[0]! : '00-docs-index';

  let content = await getMarkdown(slug);
  if (content == null) notFound();

  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) content = content.slice(end + 4);
  }

  return (
    <article className="doc-content max-w-3xl text-foreground [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('http')) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            }
            const howToMatch = href?.match(/^(?:\.\/)?(\d{2}-[a-z0-9-]+)\.(md|mdx)$/i);
            const howToPathMatch = href?.match(/^how-to\/(\d{2}-[a-z0-9-]+)\.(md|mdx)$/i);
            const slug = howToMatch?.[1] ?? howToPathMatch?.[1];
            if (slug && VALID_SLUGS.has(slug as DocSlug)) {
              const docHref = slug === '00-index' ? '/docs/00-index' : slug === '00-docs-index' ? '/docs' : `/docs/${slug}`;
              return (
                <Link href={docHref} className="text-primary hover:underline">
                  {children}
                </Link>
              );
            }
            return <a href={href}>{children}</a>;
          },
          pre: ({ children }) => (
            <pre className="rounded-lg border border-border bg-muted/50 p-4 overflow-x-auto">
              {children}
            </pre>
          ),
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
        {content}
      </ReactMarkdown>
    </article>
  );
}

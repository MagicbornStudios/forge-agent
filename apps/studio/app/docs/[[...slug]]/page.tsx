import { readFile } from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { DOC_ENTRIES } from '../docs-config';
import { createMdxComponents } from '../mdx-components';

const VALID_SLUGS = new Set(DOC_ENTRIES.map((e) => e.slug));

const REPO_ROOT = path.join(process.cwd(), '..', '..');

function getDocPaths(slug: string): string[] {
  if (slug === '00-docs-index' || slug === '18-agent-artifacts-index' || slug === '19-coding-agent-strategy') {
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

  const content = await getMarkdown(slug);
  if (content == null) notFound();

  const { content: mdxContent } = await compileMDX({
    source: content,
    components: createMdxComponents(VALID_SLUGS),
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return (
    <article className="doc-content max-w-3xl text-foreground [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
      {mdxContent}
    </article>
  );
}

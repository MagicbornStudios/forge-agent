import { notFound } from 'next/navigation';
import { source } from '@/lib/source';
import { DocsLayoutShell } from '@forge/shared';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { createMdxComponents } from '../mdx-components';

// Avoid static generation: fumadocs serializePageTree uses legacy renderToString (incompatible with React 19)
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return source.generateParams();
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug: slugSegments } = await params;
  // /docs -> index; fumadocs root index may be [] or ['00-docs-index'] depending on meta
  const slugs = slugSegments?.length ? slugSegments : [];
  const page = source.getPage(slugs) ?? (slugs.length === 0 ? source.getPage(['00-docs-index']) : undefined);
  if (!page) notFound();

  const tree = source.getPageTree() as Root;
  const serializedTree = await source.serializePageTree(tree);

  const toc = (page.data as { toc?: { title: string; url: string; depth: number }[] }).toc ?? [];
  const body = (page.data as unknown as { body?: React.ReactNode }).body;

  const validSlugs = new Set<string>();
  const addSlugFromUrl = (url: string) => {
    if (url === '/docs' || url === '/docs/') {
      validSlugs.add('00-docs-index');
      return;
    }
    if (url.startsWith('/docs/')) {
      validSlugs.add(url.slice('/docs/'.length));
    }
  };
  const collectSlugs = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.type === 'page') {
        addSlugFromUrl(node.url);
      } else if (node.type === 'folder') {
        if (node.index?.url) addSlugFromUrl(node.index.url);
        collectSlugs(node.children);
      }
    }
  };
  collectSlugs(tree.children);
  validSlugs.add('00-docs-index');

  const mdxComponents = createMdxComponents(validSlugs);
  const MdxBody = typeof body === 'function' ? body : null;

  return (
    <DocsLayoutShell serializedTree={serializedTree} toc={toc}>
      <article className="doc-content text-foreground [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
        {MdxBody ? <MdxBody components={mdxComponents} /> : null}
      </article>
    </DocsLayoutShell>
  );
}

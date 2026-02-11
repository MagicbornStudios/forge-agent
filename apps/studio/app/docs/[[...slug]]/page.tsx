import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import { DOCS_ARTICLE_CLASS } from '@forge/shared';
import { source } from '@/lib/source';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { createMdxComponents } from '../mdx-components';
import { DocsShell } from '../DocsShell';

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
  const title = (page.data as { title?: string }).title ?? 'Documentation';
  const description = (page.data as { description?: string }).description;

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
  const MdxBody = (typeof body === 'function' ? body : null) as ComponentType<{
    components: typeof mdxComponents;
  }> | null;

  return (
    <DocsShell serializedTree={serializedTree} toc={toc} baseUrl="/docs">
      <article className={DOCS_ARTICLE_CLASS}>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {MdxBody ? <MdxBody components={mdxComponents} /> : body ?? null}
      </article>
    </DocsShell>
  );
}

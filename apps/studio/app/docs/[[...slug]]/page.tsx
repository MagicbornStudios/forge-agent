import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import { DOCS_ARTICLE_CLASS } from '@forge/shared';
import { source } from '@/lib/source';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { findNeighbour } from 'fumadocs-core/page-tree';
import { toPlainText, toTitleFromHref } from '@forge/shared';
import { createMdxComponents } from '../mdx-components';
import { DocsShell } from '../DocsShell';
import { PrevNext } from '@/components/docs';

const BASE_URL = '/docs';

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
    if (url === BASE_URL || url === `${BASE_URL}/`) {
      validSlugs.add('00-docs-index');
      return;
    }
    if (url.startsWith(`${BASE_URL}/`)) {
      validSlugs.add(url.slice(`${BASE_URL}/`.length));
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

  const currentUrl = slugs.length === 0 ? BASE_URL : `${BASE_URL}/${slugs.join('/')}`;
  const neighbours = findNeighbour(tree, currentUrl);
  const prevNext = {
    prev: neighbours.prev
      ? { href: neighbours.prev.url, label: toPlainText(neighbours.prev.name, toTitleFromHref(neighbours.prev.url, 'Previous')) }
      : undefined,
    next: neighbours.next
      ? { href: neighbours.next.url, label: toPlainText(neighbours.next.name, toTitleFromHref(neighbours.next.url, 'Next')) }
      : undefined,
  };

  const mdxComponents = createMdxComponents(validSlugs);
  const MdxBody = (typeof body === 'function' ? body : null) as ComponentType<{
    components: typeof mdxComponents;
  }> | null;

  return (
    <DocsShell serializedTree={serializedTree} toc={toc} baseUrl={BASE_URL}>
      <article className={DOCS_ARTICLE_CLASS}>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {MdxBody ? <MdxBody components={mdxComponents} /> : body ?? null}
        <PrevNext prev={prevNext.prev} next={prevNext.next} />
      </article>
    </DocsShell>
  );
}

import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import { DOCS_ARTICLE_CLASS } from '@/components/docs/doc-content';
import { source } from '@/lib/source';
import { DocsShell } from '../DocsShell';

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
  const slugs = slugSegments?.length ? slugSegments : [];
  const page = source.getPage(slugs) ?? (slugs.length === 0 ? source.getPage(['index']) : undefined);
  if (!page) notFound();

  const serializedTree = await source.serializePageTree(source.getPageTree());
  const toc = (page.data as { toc?: { title: string; url: string; depth: number }[] }).toc ?? [];
  const body = (page.data as unknown as { body?: React.ReactNode }).body;
  const title = (page.data as { title?: string }).title ?? 'Documentation';
  const description = (page.data as { description?: string }).description;
  const MdxBody = (typeof body === 'function' ? body : null) as ComponentType<{
    components?: Record<string, unknown>;
  }> | null;

  return (
    <DocsShell serializedTree={serializedTree} toc={toc} baseUrl="/docs">
      <article className={DOCS_ARTICLE_CLASS}>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {MdxBody ? <MdxBody components={{}} /> : body ?? null}
      </article>
    </DocsShell>
  );
}

import { notFound, redirect } from 'next/navigation';
import type { ComponentType } from 'react';
import { DOCS_ARTICLE_CLASS } from '@/components/docs/doc-content';
import {
  withAudienceQuery,
  normalizeDocsAudience,
  isSlugVisibleForAudience,
  type DocsAudience,
} from '@/lib/docs/audience';
import { resolveDocsAlias } from '@/lib/docs/aliases';
import { source } from '@/lib/source';
import { DocsShell } from '../DocsShell';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return source.generateParams();
}

function redirectToDoc(slugs: string[], audience: DocsAudience) {
  const joined = slugs.join('/');
  const pathname = joined.length > 0 ? `/docs/${joined}` : '/docs';
  redirect(withAudienceQuery(pathname, audience));
}

const COMPONENT_DOC_CATEGORIES = [] as const;

function resolveComponentCategoryAlias(slugs: string[]): string[] | null {
  if (slugs.length !== 2 || slugs[0] !== 'components') return null;
  if (source.getPage(slugs)) return null;

  const componentSlug = slugs[1];
  if (!componentSlug || componentSlug === 'index') return null;

  const matches: string[][] = [];
  for (const category of COMPONENT_DOC_CATEGORIES) {
    const candidate = ['components', category, componentSlug];
    if (source.getPage(candidate)) {
      matches.push(candidate);
    }
  }

  return matches[0] ?? null;
}

export default async function DocPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ audience?: string | string[] }>;
}) {
  const [{ slug: slugSegments }, rawSearchParams] = await Promise.all([params, searchParams]);

  const audience = normalizeDocsAudience(rawSearchParams.audience);
  const originalSlugs = slugSegments?.length ? slugSegments : [];
  const aliased = resolveDocsAlias(originalSlugs);
  const componentAliased = aliased ? null : resolveComponentCategoryAlias(originalSlugs);
  const resolvedAlias = aliased ?? componentAliased;

  if (resolvedAlias) {
    const normalizedOriginal = originalSlugs.join('/').replace(/\.(md|mdx)$/i, '').replace(/\/index$/i, '');
    const normalizedTarget = resolvedAlias.join('/');
    if (normalizedOriginal !== normalizedTarget) {
      redirectToDoc(resolvedAlias, audience);
    }
  }

  const slugs = resolvedAlias ?? originalSlugs;
  const visibilitySlug = slugs.join('/');
  if (!isSlugVisibleForAudience(visibilitySlug, audience, '/docs')) {
    notFound();
  }

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
    <DocsShell serializedTree={serializedTree} toc={toc} baseUrl="/docs" audience={audience}>
      <article className={DOCS_ARTICLE_CLASS}>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {MdxBody ? <MdxBody components={{}} /> : body ?? null}
      </article>
    </DocsShell>
  );
}

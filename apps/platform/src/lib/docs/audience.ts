export type DocsAudience = 'developer';

export const DEFAULT_DOCS_AUDIENCE: DocsAudience = 'developer';

const DEVELOPER_ROOTS = new Set([
  '',
  'index',
  'components',
]);

export function normalizeDocsAudience(value?: string | string[] | null): DocsAudience {
  return DEFAULT_DOCS_AUDIENCE;
}

export function stripDocsBase(pathname: string, baseUrl = '/docs'): string {
  if (!pathname.startsWith(baseUrl)) return pathname.replace(/^\/+/, '');
  const slug = pathname.slice(baseUrl.length).replace(/^\/+/, '');
  return slug;
}

export function getRootSlug(slugOrPath: string, baseUrl = '/docs'): string {
  const slug = stripDocsBase(slugOrPath, baseUrl)
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\/index$/i, '');
  if (!slug) return '';
  return slug.split('/')[0] ?? '';
}

export function inferAudienceFromPath(pathname: string, baseUrl = '/docs'): DocsAudience {
  return DEFAULT_DOCS_AUDIENCE;
}

export function isSlugVisibleForAudience(slugOrPath: string, audience: DocsAudience, baseUrl = '/docs'): boolean {
  const root = getRootSlug(slugOrPath, baseUrl);
  return DEVELOPER_ROOTS.has(root);
}

export function withAudienceQuery(href: string, audience: DocsAudience): string {
  return href;
}

export function getAudienceTabs(baseUrl = '/docs'): Array<{ audience: DocsAudience; label: string; href: string }> {
  return [
    { audience: 'developer', label: 'Developer', href: `${baseUrl}/components` },
  ];
}

export function shouldShowSeparator(_audience: DocsAudience): boolean {
  return true;
}

export type DocsAudience = 'developer' | 'developer-internal';

export const DEFAULT_DOCS_AUDIENCE: DocsAudience = 'developer';
export const isInternalAudienceEnabled = process.env.NODE_ENV === 'development';

const DEVELOPER_ROOTS = new Set([
  '',
  'index',
  'components',
]);

export function normalizeDocsAudience(value?: string | string[] | null): DocsAudience {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized === 'developer-internal' && isInternalAudienceEnabled) {
    return 'developer-internal';
  }
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
  if (!isInternalAudienceEnabled) return href;
  if (audience === DEFAULT_DOCS_AUDIENCE) return href;

  const [path, hash = ''] = href.split('#', 2);
  const [pathname, existingQuery = ''] = path.split('?', 2);
  const params = new URLSearchParams(existingQuery);
  params.set('audience', audience);
  const query = params.toString();
  const withQuery = query ? `${pathname}?${query}` : pathname;
  return hash ? `${withQuery}#${hash}` : withQuery;
}

export function getAudienceTabs(baseUrl = '/docs'): Array<{ audience: DocsAudience; label: string; href: string }> {
  const tabs: Array<{ audience: DocsAudience; label: string; href: string }> = [
    { audience: 'developer', label: 'Developer', href: `${baseUrl}/components` },
  ];

  if (isInternalAudienceEnabled) {
    tabs.push({
      audience: 'developer-internal',
      label: 'Developer (internal)',
      href: `${baseUrl}/components?audience=developer-internal`,
    });
  }

  return tabs;
}

export function shouldShowSeparator(_audience: DocsAudience): boolean {
  return true;
}

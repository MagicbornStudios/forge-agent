export type DocsAudience = 'developer' | 'developer-internal';

export const DEFAULT_DOCS_AUDIENCE: DocsAudience = 'developer';

const DEVELOPER_ROOTS = new Set([
  '',
  'index',
  'components',
  'developer-guide',
  'tutorials',
  'guides',
  'reference',
  'ai-system',
  'api-reference',
  'ai',
  'yarn-spinner',
]);

const DEVELOPER_INTERNAL_ONLY_ROOTS = new Set([
  'developer-internal',
]);

export function normalizeDocsAudience(value?: string | string[] | null): DocsAudience {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === 'developer-internal' ? 'developer-internal' : DEFAULT_DOCS_AUDIENCE;
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
  const root = getRootSlug(pathname, baseUrl);
  if (DEVELOPER_INTERNAL_ONLY_ROOTS.has(root)) return 'developer-internal';
  return 'developer';
}

export function isSlugVisibleForAudience(slugOrPath: string, audience: DocsAudience, baseUrl = '/docs'): boolean {
  const root = getRootSlug(slugOrPath, baseUrl);
  if (audience === 'developer-internal') {
    return DEVELOPER_ROOTS.has(root) || DEVELOPER_INTERNAL_ONLY_ROOTS.has(root);
  }
  return DEVELOPER_ROOTS.has(root);
}

export function withAudienceQuery(href: string, audience: DocsAudience): string {
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
  return [
    { audience: 'developer', label: 'Developer', href: `${baseUrl}/components` },
    {
      audience: 'developer-internal',
      label: 'Developer (internal)',
      href: `${baseUrl}/developer-internal?audience=developer-internal`,
    },
  ];
}

export function shouldShowSeparator(_audience: DocsAudience): boolean {
  return true;
}

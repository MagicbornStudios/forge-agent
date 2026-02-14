const DOC_SLUG_ALIASES: Record<string, string> = {
  'components/00-index': 'components/index',
};

function normalizeSlug(slug: string): string {
  return slug
    .replace(/^\/+/, '')
    .replace(/\.(md|mdx)$/i, '')
    .replace(/\/index$/i, '')
    .replace(/\/$/, '');
}

export function resolveDocsAlias(slugs: string[]): string[] | null {
  if (slugs.length === 0) return null;
  const joined = normalizeSlug(slugs.join('/'));

  const direct = DOC_SLUG_ALIASES[joined];
  if (direct) return direct.split('/');

  // Handle extension-bearing legacy paths like /docs/components/editor-shell-complete.mdx
  const noExt = joined.replace(/\.(md|mdx)$/i, '');
  if (noExt !== joined && DOC_SLUG_ALIASES[noExt]) {
    return DOC_SLUG_ALIASES[noExt].split('/');
  }

  return null;
}

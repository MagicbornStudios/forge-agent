const DOC_SLUG_ALIASES: Record<string, string> = {
  'editor-shell': 'components/editor-shell',
  'dock-layout': 'components/dock-layout',
  'dock-panel': 'components/dock-panel',
  'editor-toolbar': 'components/editor-toolbar',
  'editor-inspector': 'components/editor-inspector',
  'editor-overlay': 'components/editor-overlay',
  'panel-tabs': 'components/panel-tabs',
  'settings-system': 'components/settings-system',
  'components/editor-shell-complete': 'components/editor-shell',
  'components/dock-layout-complete': 'components/dock-layout',
  'components/dock-panel-complete': 'components/dock-panel',
  'components/editor-toolbar-complete': 'components/editor-toolbar',
  'components/editor-inspector-complete': 'components/editor-inspector',
  'components/editor-overlay-complete': 'components/editor-overlay',
  'components/editor-overlay-surface': 'components/editor-overlay',
  'components/editor-overlay-surface-complete': 'components/editor-overlay',
  'components/editor-status-bar': 'components/editor/editor-status-bar',
  'components/editor-review-bar': 'components/editor/editor-review-bar',
  'components/editor-button': 'components/editor/editor-button',
  'components/editor-menubar': 'components/editor/toolbar-editor-menubar',
  'components/panel-tabs-complete': 'components/panel-tabs',
  'components/settings-system-complete': 'components/settings-system',
  'components/00-index': 'components/index',
  'developer-guide/00-index': 'developer-guide/index',
  'ai-system/00-index': 'ai-system/overview',
  'roadmap.mdx': 'roadmap',
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

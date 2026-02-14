import type { DocsAudience } from './audience';

const FALLBACK_ICONS: Record<string, string> = {
  index: 'BookOpenText',
  overview: 'BookOpenText',
  components: 'Component',
};

const AUDIENCE_DEFAULTS: Record<DocsAudience, string> = {
  developer: 'FileCode2',
};

export function getFallbackIconNameForSlug(rootSlug: string, audience: DocsAudience): string {
  return FALLBACK_ICONS[rootSlug] ?? AUDIENCE_DEFAULTS[audience];
}

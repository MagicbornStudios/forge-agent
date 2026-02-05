/**
 * Consumer-facing doc slugs and labels for the marketing site.
 */
export const DOC_ENTRIES = [
  { slug: 'index', label: 'Overview' },
  { slug: 'getting-started', label: 'Getting started' },
  { slug: 'features', label: 'Features' },
  { slug: 'pricing', label: 'Pricing' },
] as const;

export type DocSlug = (typeof DOC_ENTRIES)[number]['slug'];

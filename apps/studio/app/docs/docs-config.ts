/**
 * Doc slugs and labels for the docs sidebar.
 * Root index: docs/index.mdx. How-tos: docs/how-to/<slug>.mdx.
 */
export const DOC_ENTRIES = [
  { slug: 'index', label: 'Start here' },
  { slug: 'onboarding/01-welcome', label: 'Onboarding' },
  { slug: 'how-to/00-index', label: 'How-to guides' },
  { slug: 'how-to/01-foundation', label: '01 - Foundation' },
  { slug: 'how-to/02-editor-shell', label: '02 - Editor shell' },
  { slug: 'how-to/05-building-an-editor', label: '05 - Building an editor' },
  { slug: 'how-to/06-dialogue-walkthrough', label: '06 - Dialogue walkthrough' },
  { slug: 'how-to/07-assistant-and-ai', label: '07 - Assistant and AI' },
  { slug: 'how-to/25-verdaccio-local-registry', label: '25 - Verdaccio' },
  { slug: '18-agent-artifacts-index', label: 'Agent artifacts index' },
  { slug: '19-coding-agent-strategy', label: 'Coding agent strategy' },
] as const;

export type DocSlug = (typeof DOC_ENTRIES)[number]['slug'];

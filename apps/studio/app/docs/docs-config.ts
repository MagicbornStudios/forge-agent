/**
 * Doc slugs and labels for the docs sidebar.
 * Start-here index: docs/<slug>.mdx. How-tos: docs/how-to/<slug>.mdx (or .md fallback).
 */
export const DOC_ENTRIES = [
  { slug: '00-docs-index', label: 'Start here' },
  { slug: '00-index', label: 'How-to guides' },
  { slug: '01-foundation', label: '01 - Foundation' },
  { slug: '02-workspace-shell', label: '02 - Editor shell and slots' },
  { slug: '03-styling', label: '03 - Styling and theming' },
  { slug: '04-data-and-state', label: '04 - Data and state' },
  { slug: '05-building-a-workspace', label: '05 - Building an editor' },
  { slug: '06-forge-workspace-walkthrough', label: '06 - Dialogue Editor walkthrough' },
  { slug: '07-copilot', label: '07 - Copilot and AI integration' },
  { slug: '08-adding-ai-to-workspaces', label: '08 - Adding AI to editors' },
  { slug: '09-twick-workspace', label: '09 - Video Editor walkthrough' },
  { slug: '20-create-a-workspace', label: '20 - Create an editor' },
  { slug: '21-migration-guide-workspace-to-editor', label: '21 - Workspace to editor migration' },
  { slug: '22-ai-generation-components', label: '22 - AI generation components' },
  { slug: '25-verdaccio-local-registry', label: '25 - Verdaccio and local registry' },
  { slug: '18-agent-artifacts-index', label: 'Agent artifacts index' },
  { slug: '19-coding-agent-strategy', label: 'Coding agent strategy' },
] as const;

export type DocSlug = (typeof DOC_ENTRIES)[number]['slug'];

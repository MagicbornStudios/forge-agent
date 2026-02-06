/**
 * Doc slugs and labels for the docs sidebar.
 * Start-here index: docs/<slug>.mdx. How-tos: docs/how-to/<slug>.mdx (or .md fallback).
 */
export const DOC_ENTRIES = [
  { slug: '00-docs-index', label: 'Start here' },
  { slug: '00-index', label: 'How-to guides' },
  { slug: '01-foundation', label: '01 - Foundation' },
  { slug: '02-workspace-shell', label: '02 - Workspace shell and slots' },
  { slug: '03-styling', label: '03 - Styling and theming' },
  { slug: '04-data-and-state', label: '04 - Data and state' },
  { slug: '05-building-a-workspace', label: '05 - Building a workspace' },
  { slug: '06-forge-workspace-walkthrough', label: '06 - ForgeWorkspace walkthrough' },
  { slug: '07-copilot', label: '07 - Copilot and AI integration' },
  { slug: '08-adding-ai-to-workspaces', label: '08 - Adding AI to workspaces' },
  { slug: '09-twick-workspace', label: '09 - Twick video workspace' },
  { slug: '20-create-a-workspace', label: '20 - Create a workspace' },
  { slug: '18-agent-artifacts-index', label: 'Agent artifacts index' },
  { slug: '19-coding-agent-strategy', label: 'Coding agent strategy' },
] as const;

export type DocSlug = (typeof DOC_ENTRIES)[number]['slug'];

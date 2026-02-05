/**
 * Doc slugs and labels for the how-to sidebar.
 * Files live in repo root: docs/how-to/<slug>.md
 */
export const DOC_ENTRIES = [
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
] as const;

export type DocSlug = (typeof DOC_ENTRIES)[number]['slug'];

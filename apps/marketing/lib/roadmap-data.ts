/**
 * Public roadmap data. Sourced from docs/roadmap/product.mdx and docs/product/mvp-and-revenue.mdx.
 * Categories: Active (in progress), Planned (next / later), Shipped (done).
 */

/** Short MVP summary for the roadmap page. See docs/product/mvp-and-revenue.mdx. */
export const ROADMAP_MVP_SUMMARY = {
  firstRevenue: 'Paid clone/download',
  mvpEditors: ['Dialogue', 'Character', 'Writer', 'GamePlayer'],
  creatorsFromDayOne: true,
  mvpSuccess: 'First paid clone end-to-end',
  mvpInfra: 'Vercel + Payload',
  platform: 'Marketing site (landing + platform)',
  heroMoments: [
    'Author a small game fully with AI',
    'Layer Studio on existing projects with our Codebase Agent Strategy',
  ],
  audience:
    'Writers, game content/narrative teams, indie game devs, AAA teams (prototype or enhance coding agents).',
  positioning:
    'Game/narrative content authoring engine, AI- and chat-first — a thin engine and content + agent layer.',
  planTiers: 'Paid and free',
  catalog: 'Users and orgs',
  yarnInMvp: true,
  revenueShare: 'Revenue share with creators (Unity Asset Store / Bandlab style).',
};

export type RoadmapStatus = 'active' | 'planned' | 'shipped';

export interface RoadmapItem {
  id: string;
  title: string;
  status: RoadmapStatus;
  statusLabel: string;
  description: string;
  impact?: string;
}

export const ROADMAP_ITEMS: RoadmapItem[] = [
  // Active
  {
    id: 'dialogue-editor',
    title: 'Dialogue editor (Yarn Spinner)',
    status: 'active',
    statusLabel: 'In progress',
    description:
      'Yarn Spinner dialogue graph editing, plan→patch→review workflow, domain copilot actions, dual graph panels (narrative + storylet).',
  },
  {
    id: 'character-editor',
    title: 'Character editor',
    status: 'active',
    statusLabel: 'In progress',
    description:
      'Character relationship graph with React Flow, tabbed sidebar with node palette, ElevenLabs voice integration.',
  },
  {
    id: 'video-editor',
    title: 'Video editor',
    status: 'active',
    statusLabel: 'In progress',
    description:
      'Twick timeline editor, track list and timeline panels. Pending: map Twick state to VideoDoc and persistence.',
  },
  {
    id: 'strategy-editor',
    title: 'Strategy editor',
    status: 'active',
    statusLabel: 'In progress',
    description:
      'assistant-ui and tool-ui based chat editor, streaming AI SDK endpoint. Per-editor strategies for codebases and agent artifacts.',
  },
  // Planned
  {
    id: 'editors-mcp',
    title: 'Editors as MCP Apps',
    status: 'planned',
    statusLabel: 'Planned',
    description:
      'Expose each editor as an MCP App for Claude Desktop, Cursor, VS Code. McpAppDescriptor, Studio MCP Server, streaming tool results.',
    impact: 'Large',
  },
  {
    id: 'yarn-first-class',
    title: 'First-class Yarn Spinner support',
    status: 'planned',
    statusLabel: 'Planned',
    description:
      'Export/import .yarn files, Yarn syntax preview, variable panel, command palette.',
    impact: 'Medium',
  },
  {
    id: 'yarn-full',
    title: 'Full Yarn Spinner implementation',
    status: 'planned',
    statusLabel: 'Planned',
    description:
      'Compile to bytecode, runtime preview, localization, custom commands, Unity/Unreal export.',
  },
  {
    id: 'writer-editor',
    title: 'Writer editor',
    status: 'planned',
    statusLabel: 'Planned',
    description:
      'Notion-inspired pages and blocks. Payload collections and hooks in place; WriterEditor UI and shell pending.',
  },
  {
    id: 'publish-host',
    title: 'Publish and host project builds',
    status: 'planned',
    statusLabel: 'Planned',
    description: 'Authors publish builds; we host playable narratives. Build pipeline, storage, playable runtime.',
    impact: 'Large',
  },
  {
    id: 'monetization',
    title: 'Monetization (clone / download)',
    status: 'planned',
    statusLabel: 'Planned',
    description: 'Clone to account or download for a price. Listings, checkout, Stripe Connect.',
    impact: 'Epic',
  },
  {
    id: 'plan-tiers',
    title: 'Plan tiers and capabilities',
    status: 'planned',
    statusLabel: 'Planned',
    description: 'Extend plans and CAPABILITIES to gate platform features (publish, monetize).',
    impact: 'Small–Medium',
  },
  {
    id: 'video-workflow',
    title: 'Video workflow panel',
    status: 'planned',
    statusLabel: 'Planned',
    description: 'Plan → patch → review workflow for video, mirroring Dialogue editor.',
    impact: 'Medium',
  },
  // Shipped
  {
    id: 'editor-platform',
    title: 'Editor platform (DockLayout, EditorShell)',
    status: 'shipped',
    statusLabel: 'Shipped',
    description:
      'Unified editor shell with DockLayout, panel tabs, and project context at app level. All editors (Dialogue, Character, Video, Strategy) use the same layout primitives.',
  },
  {
    id: 'marketing-site',
    title: 'Marketing site',
    status: 'shipped',
    statusLabel: 'Shipped',
    description:
      'Landing page, consumer docs, login, account and billing, waitlist and newsletter, roadmap and changelog pages, pricing.',
  },
  {
    id: 'user-settings-theme',
    title: 'User-scoped settings and theme',
    status: 'shipped',
    statusLabel: 'Shipped',
    description:
      'Settings-overrides with optional user relation; theme and density (compact/comfortable) persisted per user; theme switcher in app bar.',
  },
  {
    id: 'assistant-tool-ui',
    title: 'Strategy editor (assistant-ui + tool-ui)',
    status: 'shipped',
    statusLabel: 'Shipped',
    description:
      'CodebaseAgentStrategyEditor with streaming chat, plan cards, and 25+ tool-ui components for coding agent workflows.',
  },
];

export const ROADMAP_CATEGORIES: { key: RoadmapStatus; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'planned', label: 'Planned' },
  { key: 'shipped', label: 'Shipped' },
];

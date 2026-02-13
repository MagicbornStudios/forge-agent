export interface ChangelogEntry {
  date: string;
  version?: string;
  highlights: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-02-12',
    version: '0.3.0',
    highlights: [
      'LangGraph chat infrastructure: @forge/assistant-runtime, Forge/Character workflows, MCP adapters.',
      'CopilotKit fully removed; domain contracts, tools, Assistant UI primary; model switcher stable.',
      'Platform docs overhaul: audience nav, full component catalog, slug redirects, platform-docs-doctor.',
      'Platform API decomposition, dashboard auth, org model, storage metering, API keys with AI attribution.',
      'Env DX: manifest, portal, bootstrap, Vercel sync.',
      'Studio: AppProviders consolidation, settings rail UX, panel hide reclaims space.',
      'Docs migration: cutover to new structure, agent artifacts updated.',
    ],
  },
  {
    date: '2026-02-07',
    version: '0.2.0',
    highlights: [
      'Project switching at app level: shared project context for Dialogue and Character editors.',
      'User-scoped settings overrides with optional user relation and per-user persistence.',
      'Design system styling: token layers, theme switcher with density (compact/comfortable).',
      'Vendored Twick as git submodule; pnpm overrides and vendor workflow documented.',
      'Workspace removed from public API; all consumers use Editor* components.',
      'Editor migration: DockLayout, PanelTabs, assistant-ui/tool-ui, assistant-chat.',
      'Docs and MCP roadmap: architecture docs, product roadmap, Yarn Spinner section.',
    ],
  },
  {
    date: '2026-02-06',
    highlights: [
      'Dual narrative/storylet editors, shared graph chrome, project switcher.',
      'ElevenLabs character voice support (voiceId, API routes, preview).',
      'Shadcn-first theming; Tailwind v4 no-config; token migration.',
      'Model routing: OpenRouter fallbacks; preferences primary + fallback chain.',
      'Settings persistence: settings-overrides, GET/POST /api/settings, Save in sheet.',
      'Zustand persist: app-shell route + lastDocIds; graph/video drafts with rehydration.',
    ],
  },
  {
    date: '2026-02-05',
    highlights: [
      'PlanCard/PlanActionBar + ForgePlanCard for plans inline in chat.',
      'Twick Studio skeleton in VideoEditor (LivePlayerProvider, TimelineProvider).',
      'Agent-engine workflow runtime, SSE route, useWorkflowRun streaming hook.',
      'Workflow streaming in Dialogue inspector (plan + patch + review).',
      'EditorApp + AppProviders; examples/consumer for @forge/dev-kit.',
      'Platform site: apps/platform with landing, docs, login, account, and billing.',
    ],
  },
  {
    date: '2026-02-04',
    highlights: [
      'Monorepo reorg: apps/studio + packages/*, packages/ui for shared shadcn atoms.',
      'Users + Projects collections, seed data, payload type generation.',
      'Entitlements + FeatureGate + paywall; settings config-based with overrides.',
    ],
  },
];

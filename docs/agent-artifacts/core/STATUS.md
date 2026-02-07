---
title: Agent artifacts status
created: 2026-02-04
updated: 2026-02-07
---

Living artifact for agents. Index: [18-agent-artifacts-index.mdx](../../18-agent-artifacts-index.mdx).

# Status

> **For coding agents.** See [Agent artifacts index](../../18-agent-artifacts-index.mdx) for the full list.

## Current

- **Production target:** 2/14. Core and Ralph Wiggum loop only; no legacy or deprecated code in the editor platform.
- **Product vision**: Forge Agent is an AI-first interactive narrative storytelling engine with Yarn Spinner compatible dialogue editing, character relationship graphs, video timeline editing, and AI agent strategy chat. See [product roadmap](../../roadmap/product.mdx).
- **Apps**: Studio in `apps/studio`; consumer-facing marketing site in `apps/marketing` (landing, docs, login, account, billing, waitlist, newsletter). Marketing shares Payload (Studio) for auth and data; set `NEXT_PUBLIC_STUDIO_APP_URL` for API and "Open app" link.
- **pnpm workspaces**: Root scripts filter to `@forge/studio`. Shared packages live under `packages/*`.
- **Shared UI kit**: `packages/shared/src/shared` provides EditorShell, DockLayout (Dockview: undock, drag, reorder, persist), DockPanel, PanelTabs, and theme tokens. Design language: [03-design-language.mdx](../../design/03-design-language.mdx) (Spotify, neobrutal, Rave, shadcn-first).
- **Assistant UI + tool UI**: shared components live in `packages/shared/src/shared/components/assistant-ui` and `packages/shared/src/shared/components/tool-ui` for the Strategy editor and consumer example.
- **Shared atoms**: `packages/ui` hosts shadcn primitives used across the app and shared UI.
- **Public packages**: `@forge/ui`, `@forge/shared`, `@forge/agent-engine`, and `@forge/dev-kit` are publishable via Verdaccio for consumers.
- **Vendored Twick**: Twick is vendored at `vendor/twick` as a git submodule; pnpm workspace overrides resolve `@twick/*` from the vendored packages. See [How-to 24](../../how-to/24-vendoring-third-party-code.mdx).
- **Copilot runtime wrapper**: `@forge/shared/copilot/next` exports `createForgeCopilotRuntime(...)` and `ForgeCopilotProvider` (Next.js only).
- **Entitlements & gates**: Capability registry + `FeatureGate` are in shared; Studio provides a local entitlements store and paywall sheet.
- **Plan UI**: Dialogue plans render in chat with `PlanCard` + `PlanActionBar` and `ForgePlanCard`, then review in the editor via `EditorReviewBar`.
- **Workflow runtime**: `packages/agent-engine` provides a minimal workflow engine (steps + events), SSE route at `POST /api/workflows/run`, and a streaming hook in `apps/studio/lib/ai/use-workflow-run.ts`.
- **Dialogue system**: `packages/domain-forge` contains Dialogue logic and copilot wiring (domain package = system). Video remains a UI showcase under `apps/studio/lib/domains/video` (not a focus).
- **Video editor**: `VideoEditor` renders a minimal Twick Studio surface (LivePlayerProvider + TimelineProvider + TwickStudio); persistence integration is pending.
- **App shell**: `EditorApp` is the semantic root for AppLayout; Studio composes providers via `AppProviders` for drop-in usage.
- **Consumer example**: `examples/consumer` shows a minimal Next app using `@forge/dev-kit` and `CodebaseAgentStrategyEditor` with `/api/assistant-chat`.
- **Docs**: In-app docs render MDX with JSX components (next-mdx-remote/rsc) and include migration + AI generation guides.
- **Dialogue editor**: Dual narrative/storylet graphs per project with shared chrome (DockLayout (Dockview), panel tabs). Project is selected at app level (see below). Yarn Spinner integration planned (export/import `.yarn` files, syntax preview, variable tracking).
- **Strategy editor**: CodebaseAgentStrategyEditor using assistant-ui + tool-ui; streaming chat with tool rendering; thread management.
- **Editors as MCP Apps**: Architecture defined; each editor exposable as MCP App (tool + UI resource) for external hosts. See [07 - Editors as MCP Apps](../../architecture/07-modes-as-mcp-apps.mdx).
- **Character editor**: Aligned chrome with tabbed sidebar and node palette; drag-drop creates characters. Project is selected at app level.
- **Forge graphs**: Collection includes `project` and `kind` fields; types regenerated.
- **Payload + types**: Collections in `apps/studio/payload/collections`: users, projects, forge-graphs, video-docs, settings-overrides, agent-sessions; marketing: waitlist, newsletter-subscribers, promotions. Custom API routes: `POST /api/waitlist`, `POST /api/newsletter`, `GET /api/promotions`. Types in `packages/types/src/payload-types.ts`.
- **Seeded data**: Payload seeds an admin user, a basic user, a demo graph, and a demo project on init (`apps/studio/payload/seed.ts`).
- **Settings overrides persisted**: Yes. Overrides are stored in `settings-overrides`; loaded on init via `GET /api/settings` and `hydrateFromOverrides`; saved explicitly via Save button and `POST /api/settings`. When authenticated, overrides are per-user (optional `user` relation; GET/POST filter by current user).

## Ralph Wiggum loop

- Done (2026-02-04): Monorepo reorg to `apps/studio` + `packages/*`, added `packages/ui` for shared shadcn atoms, aligned imports to `@forge/ui`, updated settings to be config-based with overrides, aligned video domain types to Payload `video-docs`, added entitlements + FeatureGate + paywall, and rebuilt Studio.
- Done (2026-02-04): Added Users + Projects collections, seed data (admin + user + demo graph + demo project), and fixed payload type generation via `scripts/generate-payload-types.mjs`.
- Done (2026-02-05): Added plan field to users and `/api/me` to hydrate entitlements from the signed-in user plan.
- Done (2026-02-05): Added `PlanCard`/`PlanActionBar` + `ForgePlanCard` to render plans inline in chat.
- Done (2026-02-05): Added a minimal Twick Studio skeleton (LivePlayerProvider + TimelineProvider + TwickStudio) in VideoEditor (formerly VideoWorkspace).
- Done (2026-02-05): Published foundation package configs (`@forge/ui`, `@forge/shared`, `@forge/agent-engine`, `@forge/dev-kit`) and Verdaccio setup; added Next-only Copilot runtime wrapper in shared.
- Done (2026-02-05): Moved Forge workflow implementation to `packages/domain-forge` and removed legacy `src/shared` duplicates.
- Done (2026-02-05): Added agent-engine workflow runtime, shared patch/workflow event types, SSE workflow route, and `useWorkflowRun` streaming hook. Added lower-level feature gating on Editor buttons and toolbar items.
- Done (2026-02-05): Wired workflow streaming into Dialogue inspector (plan + patch + review panel) and switched Forge workflow patch proposal to a snapshot/selection loop.
- Done (2026-02-05): Added human-readable patch summaries in the Forge workflow panel and enabled MDX rendering for how-to docs.
- Done (2026-02-05): Added `EditorApp` + `AppProviders`, removed legacy `src/shared` folder, tightened Forge workflow validation (including Start node requirement), and aligned video copilot actions with `createDomainAction`.
- Done (2026-02-05): Added `examples/consumer` Next app to validate `@forge/dev-kit` usage (EditorApp + AppProviders + Copilot runtime).
- Done (2026-02-05): Marketing site: new app `apps/marketing` (Next 15, Tailwind, @forge/ui) with landing, consumer docs, login (Payload `/api/users/login`), account/billing, "Open app" link, waitlist/newsletter forms, promotions banner; Payload collections waitlist, newsletter, promotions; Studio API routes waitlist, newsletter, promotions.
- Done (2026-02-06): Fixed docs sidebar keys + MDX rendering; added Forge dual narrative/storylet editors, shared graph chrome (sidebar lists + node palette), project switcher; aligned character editor chrome and drag-drop creation; added `@forge/domain-character` to Next transpile packages and fixed project slug fallback in switchers.
- Done (2026-02-06): Added ElevenLabs character voice support (voiceId field + API routes + create/edit voice select + preview), updated env example and docs.
- Done (2026-02-06): Aligned shadcn theme tokens (sidebar/canvas/editor), updated editor chrome classes, added ElevenLabs AudioPlayer component + hooks, and wired copilot voice sample action.
- Done (2026-02-06): Shadcn-first theming + Tailwind v4 no-config: removed `tailwind.config.ts` from studio, marketing, consumer; added `@source` in each app's `globals.css`; migrated off `--color-df-*` to shadcn-first token set (`--graph-*`, `--status-*`, `--text-*`, `--control-*`, `--flag-*`, `--domain-*`, `--border-active`/`--border-hover`); updated `contexts.css`, `graph.css`, `scrollbar.css` and studio components; disabled `@next/next/no-img-element`; `@theme inline` extended with `--color-canvas`, `--color-editor`, `--color-editor-border`.
- Done (2026-02-06): Fixed MdxBody type error in docs page (cast `body` to `React.ComponentType<{ components: ... }> | null`); added errors-and-attempts entry; doc indexes, roadmap, tool-usage, compacting, 18/19 and AGENTS.md updates per Codebase Strategy plan.
- Done (2026-02-06): Model routing: removed custom auto-switch and health/cooldown; use OpenRouter model fallbacks (`models: [primary, ...fallbacks]`). Preferences: primary + fallback chain; CopilotKit, forge/plan, structured-output pass fallbacks. ModelSwitcher shows primary + fallback count; no health dots. Docs: 03-copilotkit, 01-unified-workspace, errors-and-attempts updated.
- Done (2026-02-06): Settings persistence (Slice 1). Renamed `settings-snapshots` to `settings-overrides`; added `GET`/`POST` `/api/settings`; `SettingsHydration` in layout; explicit Save in settings sheet; store `hydrateFromOverrides` and `getOverridesForScope`.
- Done (2026-02-06): Zustand persist replace. App-shell store persists route + lastGraphId/lastVideoDocId with rehydration gate; graph and video stores persist drafts (partialize when dirty), conditional rehydration when draft matches current doc, clear on save; removed AppShellRoutePersistence and local-storage get/set for route and lastDocIds.
- Done (2026-02-07): Editor migration: DialogueEditor, VideoEditor, CharacterEditor, StrategyEditor; DockLayout panels; PanelTabs; assistant-ui + tool-ui components; assistant-chat endpoint; consumer example updated; docs and AGENTS refreshed.
- Done (2026-02-07): Docs and MCP roadmap overhaul: new architecture docs (07-modes-as-mcp-apps, 08-copilotkit-vs-assistant-ui, 09-dialogue-domain-and-yarn-spinner); updated product roadmap with MCP Apps + Yarn Spinner initiatives; reframed project overview as interactive narrative storytelling engine; updated architecture index, docs index, how-to index, and all editor nomenclature references; removed legacy workspace directory; added Yarn Spinner section to DialogueEditor walkthrough.
- Done (2026-02-07): UI debug and modernization plan: design language doc (03-design-language.mdx); glow tokens and shadcn-aligned radius/type in themes and UI atoms; Inter font in Studio layout; ForgeGraphPanel top-only accent, PanelTabs bottom accent; icon audit checklist and icons on panel headers and editor tabs; enhanced-features backlog and process; Dockview spike page; DockLayout (Dockview, slot API, layoutId persistence); Dialogue, Video, Character use DockLayout; Editor layout doc in 02-components.
- Done (2026-02-07): Workspace→Editor Slice 1: Inlined WorkspaceButton into EditorButton and WorkspaceTooltip into EditorTooltip; EditorToolbar now uses EditorButton. Workspace button/tooltip files retained until workspace folder removal (consumers still use them).
- Done (2026-02-07): Workspace→Editor Slice 2: Added EditorFileMenu, EditorMenubar, EditorProjectSelect under editor/toolbar/; EditorToolbar uses them; exported from editor index.
- Done (2026-02-07): Workspace→Editor Slice 3: Added EditorInspector, EditorSidebar, EditorTab, EditorTabGroup, EditorBottomPanel; DockSidebar uses EditorSidebar; sidebar primitives and new components exported from editor index.
- Done (2026-02-07): Workspace removed from public API (Option A): Removed `export * from './shared/components/workspace'`; workspace folder deprecated; all consumers updated to Editor* and `@forge/shared`; docs and AGENTS updated; workspace-metadata deprecated in favor of editor-metadata. Verification: no apps/packages (outside internal workspace folder) import from `@forge/shared/components/workspace` or `@forge/shared/workspace`.
- Done (2026-02-07): Vendored Twick as a git submodule (`vendor/twick`), wired pnpm workspace overrides for `@twick/*`, and documented the vendor contribution workflow (How-to 24).
- Done (2026-02-07): Project switching at app level: `activeProjectId` in app-shell store; ProjectSwitcher in AppShell tab bar; Dialogue and Character editors consume shared project context; decisions and errors-and-attempts updated.
- Done (2026-02-07): Design system styling review: Token system documented in design/01 (layers, when to use which, file map, context-aware UI); duplicate `@layer base` removed from globals.css; GraphSidebar uses sidebar tokens for contrast; React Flow theme overrides in graph.css (viewport, default node, default edge); ThemeSwitcher includes density (compact/comfortable) with persist; errors-and-attempts "Theme/surface tokens" and styling-and-ui-consistency references updated.
- Done (2026-02-07): User-scoped settings-overrides: optional `user` relation on collection; GET/POST `/api/settings` use payload.auth and filter by current user; theme and app/editor settings persist per user when logged in. See decisions.md.
- In progress: None.
- Other agents: None reported.
- Done: CopilotKit architecture doc + roadmap implementation (image gen, structured output, plan-execute-review-commit).
- Next slice: Map Twick timeline state to our `VideoDoc` draft and add plan/commit UI for video proposals.

## Next

### Impact sizes

- **Small** — Single area, few files, one PR (e.g. add a capability constant, gate one UI surface).
- **Medium** — One clear slice across API + UI or data (e.g. project-scoped settings API + one settings surface).
- **Large** — Multi-slice, multiple areas (e.g. publish/host pipeline: build artifact, storage, playable runtime).
- **Epic** — Multi-week, many slices and docs (e.g. full platform monetization: listing, checkout, clone, payouts).

### What you can do next

**Where to look:** The list below is the canonical next steps; each item has an **impact size**. For more context, see [product roadmap](../../roadmap/product.mdx) and [enhanced-features backlog](./enhanced-features-backlog.md).

**How to pick work:** Prefer **one slice per item**; use impact size to scope (Small = one PR, Epic = break into slices and track in STATUS). If you start an item, add a short "In progress: …" line in the Ralph Wiggum section above so other agents or contributors don't pick the same work.

### Next steps (with impact sizes)

1. **Editors as MCP Apps** — Define `McpAppDescriptor` per editor; build Studio MCP Server. See [07 - Editors as MCP Apps](../../architecture/07-modes-as-mcp-apps.mdx). **[Impact: Large]**
2. **First-class Yarn Spinner** — Export/import `.yarn` files; syntax preview panel; variable tracking. See [09 - Dialogue system and Yarn Spinner](../../architecture/09-dialogue-domain-and-yarn-spinner.mdx). **[Impact: Medium]**
3. **Twick → VideoDoc persistence + plan/commit UI** — Map Twick timeline state to our `VideoDoc` draft and connect persistence (save/load); add plan/commit UI for video proposals. **[Impact: Medium]**
4. **Video workflow panel** — Plan -> patch -> review mirroring Dialogue. **[Impact: Medium]**
5. **Apply gates to more surfaces** — Copilot sidebar, model selection as needed. **[Impact: Small]**
6. **Project-scoped settings** — Add project scope (or scopeId = projectId) to settings-overrides and GET/POST; project-level defaults shared by project members. **[Impact: Medium]**
7. **Platform: publish and host builds** — Authors publish project build; we host playable narrative. Build pipeline, storage, playable runtime. **[Impact: Large]**
8. **Platform: monetization (clone / download)** — Clone to user/org for a price; or download build. Listings, checkout, Stripe Connect or similar. **[Impact: Epic]**
9. **Plans/capabilities for platform** — Extend `user.plan` and `CAPABILITIES` to gate platform features (e.g. publish, monetize). **[Impact: Small–Medium]**
10. **Marketing site overhaul (Part B)** — Placeholder routes (roadmap, changelog, pricing, demo, privacy, terms); docs content structure and nav; public roadmap and changelog pages; full pricing page; customer admin (sidebar, account/settings, account/billing, account/api-keys); optional login block and Hero “Watch Demo”. Implement as slices 1–8 per plan. **[Impact: Large]** *(Slices 1–8 completed.)*
11. Track any new build warnings in [errors-and-attempts.md](./errors-and-attempts.md).
12. Re-run `pnpm --filter @forge/studio build` after package updates.

**Product roadmap:** [docs/roadmap/](../../roadmap/00-roadmap-index.mdx) - [product.mdx](../../roadmap/product.mdx) for editors and initiatives. **Roadmap remaining:** Full Yarn Spinner implementation (compiler, runtime preview, localization); vision/image input (model registry + chat upload); co-agents (documented, not used). Optional future: agent graphs/subgraphs in runtime. See [architecture/03-copilotkit-and-agents.mdx](../../architecture/03-copilotkit-and-agents.mdx) Section 12.

## What changed (recent)

- **Marketing site overhaul (Part B)**: Placeholder routes (/roadmap, /changelog, /pricing, /demo, /privacy, /terms); docs content structure (editors, components, ai, yarn-spinner, api-reference, roadmap, changelog); roadmap page with Active/Planned/Shipped; changelog page from STATUS; full pricing page; account layout with sidebar (Overview, Settings, Billing, API Keys); /billing redirects to /account/billing; login page Card layout (login-01 style); Hero “Watch Demo” CTA opening HeroVideoDialog. No testimonials section.
- **User-scoped settings**: Settings-overrides collection has optional `user` relationship. GET `/api/settings` returns only the current user's overrides when authenticated (else global `user: null`). POST sets `user` on create/update. Theme and all app/editor settings persist per user. decisions.md ADR added.
- **Design system styling review**: Token system (four layers, when to use which, file map) and context-aware UI documented in [01-styling-and-theming.mdx](../../design/01-styling-and-theming.mdx). Duplicate `@layer base` removed from studio globals.css. GraphSidebar uses `text-sidebar-foreground` / `bg-sidebar-accent` for contrast. React Flow viewport, default node, and default edge use `--graph-*` tokens in graph.css. ThemeSwitcher dropdown now includes density (Compact / Comfortable); theme and density persist together. [errors-and-attempts.md](./errors-and-attempts.md) "Theme/surface tokens" and [styling-and-ui-consistency.md](./styling-and-ui-consistency.md) reference the token doc.
- **Theme switcher, user in app bar, menu tokens**: Theme switcher in app bar (persisted via settings on select); current user shown (AppBarUser with useMe, or "Not signed in"); dropdown/menu padding driven by theme tokens (`--menu-item-padding-*`, `--menu-content-padding`) in packages/ui and themes.css; app bar layout: project + editors | separator | theme + user + settings. See design/01 and architecture/02.
- **Project switching at app level**: Single `activeProjectId` in app-shell store; `ProjectSwitcher` moved from Dialogue and Character editors into AppShell (editor tab bar). All project-scoped editors share the same project context. See [decisions.md](./decisions.md) (Project context at app level).
- **Styling process and UI fixes**: How-to [26-styling-debugging-with-cursor.mdx](../../how-to/26-styling-debugging-with-cursor.mdx), agent artifact [styling-and-ui-consistency.md](./styling-and-ui-consistency.md), contrast/spacing fixes (toolbar outline buttons, PanelTabs, Dockview tabs, EditorMenubar, GraphEditorToolbar). After screenshot: [styling_after_contrast_and_spacing.png](../../images/styling_after_contrast_and_spacing.png) (see design/02-components).
- **UI consistency**: Icons on menu items (View/State/File) and editor creation/Workbench buttons; tokenized padding for AI Workflow card; design docs and errors-and-attempts updated with icon/padding rules and screenshot reference.
- **Workspace→Editor API (Option A)**: Workspace* components renamed/moved to Editor*; workspace component export removed from shared index; types re-exported from `@forge/shared` only; all consumers use Editor* and `@forge/shared`; docs and AGENTS updated.
- **Legacy/deprecated cleanup**: Single DockLayout (Dockview only); Mode* aliases and workspace-metadata/mode-metadata removed; EditorShell uses only `editorId`; docs and tests use `dialogue` and current component names; .gitignore and agent strategy updated for .tmp (do not edit); production target 2/14 in roadmap.
- **UI modernization**: Design language (Spotify, neobrutal, Rave, shadcn-first); glow/radius/type tokens; Inter font; graph/tab accent styling; icons on panels and editor tabs; enhanced-features backlog; Dockview and DockLayout (Dockview); all editors use DockLayout (layout persists to localStorage).
- **Payload SQLite CANTOPEN fix**: Default DB path is now resolved from `payload.config.ts` location (`apps/studio/data/payload.db`); `data` dir is created when `DATABASE_URI` is unset. Documented in [errors-and-attempts.md](./errors-and-attempts.md).
- **Docs and MCP roadmap overhaul**: 3 new architecture docs (Editors as MCP Apps, CopilotKit vs assistant-ui, Dialogue system and Yarn Spinner). Product roadmap expanded with MCP Apps and Yarn Spinner initiatives. Project overview reframed as interactive narrative storytelling engine.
- **Editor migration complete**: All editors (Dialogue, Video, Character, Strategy) use EditorShell + DockLayout. Legacy workspace directory removed. Naming standardized to "editor" for top-level units and "mode" for in-editor state.
- **assistant-ui + tool-ui integrated**: CodebaseAgentStrategyEditor in shared package. Thread, ThreadList, ToolFallback, ToolGroup components. 25+ tool-ui components (approval-card, terminal, plan, code-block, etc.).
- Studio app moved to `apps/studio` and workspace packages to `packages/*`, including new `packages/ui` for shared shadcn atoms.
- Payload types now flow from the app config into a shared `packages/types` package.
- Studio build succeeds; Payload emits a known dynamic import warning (documented in [errors-and-attempts.md](./errors-and-attempts.md)).
- CopilotKit runtime uses OpenAI + @ai-sdk/openai with OpenRouter baseURL; provider stack (OpenRouter / ElevenLabs / Sora) documented in 06 and decisions.

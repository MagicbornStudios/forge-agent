---
title: Agent artifacts status
created: 2026-02-04
updated: 2026-02-07
---

Living artifact for agents. Index: [18-agent-artifacts-index.mdx](../../18-agent-artifacts-index.mdx).

# Status

> **For coding agents.** See [Agent artifacts index](../../18-agent-artifacts-index.mdx) for the full list.

## Current

- **Apps**: Studio in `apps/studio`; consumer-facing marketing site in `apps/marketing` (landing, docs, login, account, billing, waitlist, newsletter). Marketing shares Payload (Studio) for auth and data; set `NEXT_PUBLIC_STUDIO_APP_URL` for API and "Open app" link.
- **pnpm workspaces**: Root scripts filter to `@forge/studio`. Shared packages live under `packages/*`.
- **Shared UI kit**: `packages/shared/src/shared` provides EditorShell, DockLayout, DockPanel, PanelTabs, ModeReviewBar, and theme tokens.
- **Assistant UI + tool UI**: shared components live in `packages/shared/src/shared/components/assistant-ui` and `packages/shared/src/shared/components/tool-ui` for the Strategy editor and consumer example.
- **Shared atoms**: `packages/ui` hosts shadcn primitives used across the app and shared UI.
- **Public packages**: `@forge/ui`, `@forge/shared`, `@forge/agent-engine`, and `@forge/dev-kit` are publishable via Verdaccio for consumers.
- **Copilot runtime wrapper**: `@forge/shared/copilot/next` exports `createForgeCopilotRuntime(...)` and `ForgeCopilotProvider` (Next.js only).
- **Entitlements & gates**: Capability registry + `FeatureGate` are in shared; Studio provides a local entitlements store and paywall sheet.
- **Plan UI**: Dialogue plans render in chat with `PlanCard` + `PlanActionBar` and `ForgePlanCard`, then review in the editor via `ModeReviewBar`.
- **Workflow runtime**: `packages/agent-engine` provides a minimal workflow engine (steps + events), SSE route at `POST /api/workflows/run`, and a streaming hook in `apps/studio/lib/ai/use-workflow-run.ts`.
- **Dialogue domain**: `packages/domain-forge` contains Dialogue logic and copilot wiring. Video remains a UI showcase under `apps/studio/lib/domains/video` (not a focus).
- **Video mode**: `VideoMode` renders a minimal Twick Studio surface (LivePlayerProvider + TimelineProvider + TwickStudio); persistence integration is pending.
- **App shell**: `EditorApp` is the semantic root for AppLayout; Studio composes providers via `AppProviders` for drop-in usage.
- **Consumer example**: `examples/consumer` shows a minimal Next app using `@forge/dev-kit` and `CodebaseAgentStrategyEditor` with `/api/assistant-chat`.
- **Docs**: In-app docs render MDX with JSX components (next-mdx-remote/rsc) and include migration + AI generation guides.
- **Dialogue mode**: Dual narrative/storylet graphs per project with shared chrome (DockLayout, panel tabs, project switcher).
- **Character mode**: Aligned chrome with tabbed sidebar and node palette; drag-drop creates characters; project switcher added.
- **Forge graphs**: Collection includes `project` and `kind` fields; types regenerated.
- **Payload + types**: Collections in `apps/studio/payload/collections`: users, projects, forge-graphs, video-docs, settings-overrides, agent-sessions; marketing: waitlist, newsletter-subscribers, promotions. Custom API routes: `POST /api/waitlist`, `POST /api/newsletter`, `GET /api/promotions`. Types in `packages/types/src/payload-types.ts`.
- **Seeded data**: Payload seeds an admin user, a basic user, a demo graph, and a demo project on init (`apps/studio/payload/seed.ts`).
- **Settings overrides persisted**: Yes. Overrides are stored in `settings-overrides`; loaded on init via `GET /api/settings` and `hydrateFromOverrides`; saved explicitly via Save button and `POST /api/settings`.

## Ralph Wiggum loop

- Done (2026-02-04): Monorepo reorg to `apps/studio` + `packages/*`, added `packages/ui` for shared shadcn atoms, aligned imports to `@forge/ui`, updated settings to be config-based with overrides, aligned video domain types to Payload `video-docs`, added entitlements + FeatureGate + paywall, and rebuilt Studio.
- Done (2026-02-04): Added Users + Projects collections, seed data (admin + user + demo graph + demo project), and fixed payload type generation via `scripts/generate-payload-types.mjs`.
- Done (2026-02-05): Added plan field to users and `/api/me` to hydrate entitlements from the signed-in user plan.
- Done (2026-02-05): Added `PlanCard`/`PlanActionBar` + `ForgePlanCard` to render plans inline in chat.
- Done (2026-02-05): Added a minimal Twick Studio skeleton (LivePlayerProvider + TimelineProvider + TwickStudio) in VideoMode (formerly VideoWorkspace).
- Done (2026-02-05): Published foundation package configs (`@forge/ui`, `@forge/shared`, `@forge/agent-engine`, `@forge/dev-kit`) and Verdaccio setup; added Next-only Copilot runtime wrapper in shared.
- Done (2026-02-05): Moved Forge workflow implementation to `packages/domain-forge` and removed legacy `src/shared` duplicates.
- Done (2026-02-05): Added agent-engine workflow runtime, shared patch/workflow event types, SSE workflow route, and `useWorkflowRun` streaming hook. Added lower-level feature gating on Editor buttons and toolbar items.
- Done (2026-02-05): Wired workflow streaming into Dialogue inspector (plan + patch + review panel) and switched Forge workflow patch proposal to a snapshot/selection loop.
- Done (2026-02-05): Added human-readable patch summaries in the Forge workflow panel and enabled MDX rendering for how-to docs.
- Done (2026-02-05): Added `EditorApp` + `AppProviders`, removed legacy `src/shared` folder, tightened Forge workflow validation (including Start node requirement), and aligned video copilot actions with `createDomainAction`.
- Done (2026-02-05): Added `examples/consumer` Next app to validate `@forge/dev-kit` usage (EditorApp + AppProviders + Copilot runtime).
- Done (2026-02-05): Marketing site: new app `apps/marketing` (Next 15, Tailwind, @forge/ui) with landing, consumer docs, login (Payload `/api/users/login`), account/billing, "Open app" link, waitlist/newsletter forms, promotions banner; Payload collections waitlist, newsletter, promotions; Studio API routes waitlist, newsletter, promotions.
- Done (2026-02-06): Fixed docs sidebar keys + MDX rendering; added Forge dual narrative/storylet editors, shared graph chrome (sidebar lists + node palette), project switcher; aligned character workspace chrome and drag-drop creation; added `@forge/domain-character` to Next transpile packages and fixed project slug fallback in switchers.
- Done (2026-02-06): Added ElevenLabs character voice support (voiceId field + API routes + create/edit voice select + preview), updated env example and docs.
- Done (2026-02-06): Aligned shadcn theme tokens (sidebar/canvas/editor), updated workspace chrome classes, added ElevenLabs AudioPlayer component + hooks, and wired copilot voice sample action.
- Done (2026-02-06): Shadcn-first theming + Tailwind v4 no-config: removed `tailwind.config.ts` from studio, marketing, consumer; added `@source` in each app's `globals.css`; migrated off `--color-df-*` to shadcn-first token set (`--graph-*`, `--status-*`, `--text-*`, `--control-*`, `--flag-*`, `--domain-*`, `--border-active`/`--border-hover`); updated `contexts.css`, `graph.css`, `scrollbar.css` and studio components; disabled `@next/next/no-img-element`; `@theme inline` extended with `--color-canvas`, `--color-editor`, `--color-editor-border`.
- Done (2026-02-06): Fixed MdxBody type error in docs page (cast `body` to `React.ComponentType<{ components: ... }> | null`); added errors-and-attempts entry; doc indexes, roadmap, tool-usage, compacting, 18/19 and AGENTS.md updates per Codebase Strategy plan.
- Done (2026-02-06): Model routing: removed custom auto-switch and health/cooldown; use OpenRouter model fallbacks (`models: [primary, ...fallbacks]`). Preferences: primary + fallback chain; CopilotKit, forge/plan, structured-output pass fallbacks. ModelSwitcher shows primary + fallback count; no health dots. Docs: 03-copilotkit, 01-unified-workspace, errors-and-attempts updated.
- Done (2026-02-06): Settings persistence (Slice 1). Renamed `settings-snapshots` to `settings-overrides`; added `GET`/`POST` `/api/settings`; `SettingsHydration` in layout; explicit Save in settings sheet; store `hydrateFromOverrides` and `getOverridesForScope`.
- Done (2026-02-06): Zustand persist replace. App-shell store persists route + lastGraphId/lastVideoDocId with rehydration gate; graph and video stores persist drafts (partialize when dirty), conditional rehydration when draft matches current doc, clear on save; removed AppShellRoutePersistence and local-storage get/set for route and lastDocIds.
- Done (2026-02-07): Editor migration: DialogueMode, VideoMode, CharacterMode, StrategyMode; DockLayout panels; PanelTabs; assistant-ui + tool-ui components; assistant-chat endpoint; consumer example updated; docs and AGENTS refreshed.
- In progress: None.
- Other agents: None reported.
- Done: CopilotKit architecture doc + roadmap implementation (image gen, structured output, plan-execute-review-commit).
- Next slice: Map Twick timeline state to our `VideoDoc` draft and add plan/commit UI for video proposals.

## Next

1. Map Twick timeline state to our `VideoDoc` draft and connect persistence (save/load).
2. Add a Video workflow panel (plan -> patch -> review) mirroring Dialogue.
3. Apply gates to more surfaces (Copilot sidebar, model selection) as needed.
4. Track any new build warnings in [errors-and-attempts.md](./errors-and-attempts.md).
5. Re-run `pnpm --filter @forge/studio build` after package updates.

**Product roadmap:** [docs/roadmap/](../../roadmap/00-roadmap-index.mdx) - [product.mdx](../../roadmap/product.mdx) for modes and initiatives. **Roadmap remaining:** Vision/image input (model registry + chat upload); co-agents (documented, not used). Optional future: agent graphs/subgraphs in runtime. See [architecture/03-copilotkit-and-agents.mdx](../../architecture/03-copilotkit-and-agents.mdx) Section 12.

## What changed (recent)

- Studio app moved to `apps/studio` and workspace packages to `packages/*`, including new `packages/ui` for shared shadcn atoms.
- Payload types now flow from the app config into a shared `packages/types` package.
- Docs updated to reflect single-app focus and new paths.
- Studio build succeeds; Payload emits a known dynamic import warning (documented in [errors-and-attempts.md](./errors-and-attempts.md)).
- CopilotKit runtime uses OpenAI + @ai-sdk/openai with OpenRouter baseURL; provider stack (OpenRouter / ElevenLabs / Sora) documented in 06 and decisions.

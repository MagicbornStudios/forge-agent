---
title: Status
created: 2026-02-04
updated: 2026-02-06
---

# Status

> **For coding agents.** See [Agent artifacts index](agent-artifacts.md) for the full list.

## Current

- **Single app**: Studio lives in `apps/studio`. There is no platform/marketing app in this repo.
- **pnpm workspaces**: Root scripts filter to `@forge/studio`. Shared packages live under `packages/*`.
- **Shared UI kit**: `packages/shared/src/shared` provides WorkspaceShell, WorkspaceLayoutGrid, toolbar, overlays, and theme tokens.
- **Shared atoms**: `packages/ui` now hosts shadcn primitives used across the app and shared UI.
- **Public packages**: `@forge/ui`, `@forge/shared`, `@forge/agent-engine`, and `@forge/dev-kit` are publishable via Verdaccio for consumers.
- **Copilot runtime wrapper**: `@forge/shared/copilot/next` exports `createForgeCopilotRuntime(...)` and `ForgeCopilotProvider` (Next.js only).
- **Entitlements & gates**: Capability registry + `FeatureGate` are in shared; Studio provides a local entitlements store and paywall sheet.
- **Plan UI**: Forge plans render in chat with `PlanCard` + `PlanActionBar` and `ForgePlanCard`, then review in the workspace via `WorkspaceReviewBar`.
- **Workflow runtime**: `packages/agent-engine` provides a minimal workflow engine (steps + events), SSE route at `POST /api/workflows/run`, and a streaming hook in `apps/studio/lib/ai/use-workflow-run.ts`.
- **Forge domain**: `packages/domain-forge` contains Forge logic and copilot wiring. Video remains a UI showcase under `apps/studio/lib/domains/video` (not a focus).
- **Video workspace**: `VideoWorkspace` uses Twick (LivePlayerProvider + TimelineProvider + TwickStudio); persistence integration is pending. Both Forge and Video are first-class domains.
- **App shell**: `AppSpace` is the semantic root for AppLayout; Studio composes providers via `AppProviders` for drop-in usage.
- **Consumer example**: `examples/consumer` shows a minimal Next app using `@forge/dev-kit` with Copilot runtime.
- **Docs**: In-app docs now render MDX with JSX components (next-mdx-remote/rsc).
- **Forge workspace**: Dual narrative/storylet graphs per project with legacy-style chrome and a project switcher.
- **Character workspace**: Aligned chrome with sidebar tabs + node palette; drag-drop creates characters; project switcher added.
- **Payload + types**: Collections live in `apps/studio/payload/collections` (users, projects, forge-graphs, video-docs, settings-overrides, agent-sessions). Payload generates types into `packages/types/src/payload-types.ts`; domain aliases live in `packages/types/src/payload.ts` and `packages/types/src/graph.ts`.
- **Seeded data**: Payload seeds an admin user, a basic user, a demo graph, and a demo project on init (`apps/studio/payload/seed.ts`).
- **Settings overrides persisted**: Yes. Overrides are stored in `settings-overrides`; loaded on init via `GET /api/settings` and `hydrateFromOverrides`; saved explicitly via Save button and `POST /api/settings`.

## Ralph Wiggum loop

- Done (2026-02-04): Monorepo reorg to `apps/studio` + `packages/*`, added `packages/ui` for shared shadcn atoms, aligned imports to `@forge/ui`, updated settings to be config-based with overrides, aligned video domain types to Payload `video-docs`, added entitlements + FeatureGate + paywall, and rebuilt Studio.
- Done (2026-02-04): Added Users + Projects collections, seed data (admin + user + demo graph + demo project), and fixed payload type generation via `scripts/generate-payload-types.mjs`.
- Done (2026-02-05): Added plan field to users and `/api/me` to hydrate entitlements from the signed-in user plan.
- Done (2026-02-05): Added `PlanCard`/`PlanActionBar` + `ForgePlanCard` to render plans inline in chat.
- Done (2026-02-05): Added a minimal Twick Studio skeleton (LivePlayerProvider + TimelineProvider + TwickStudio) in VideoWorkspace.
- Done (2026-02-05): Published foundation package configs (`@forge/ui`, `@forge/shared`, `@forge/agent-engine`, `@forge/dev-kit`) and Verdaccio setup; added Next-only Copilot runtime wrapper in shared.
- Done (2026-02-05): Moved Forge workflow implementation to `packages/domain-forge` and removed legacy `src/shared` duplicates.
- Done (2026-02-05): Added agent-engine workflow runtime, shared patch/workflow event types, SSE workflow route, and `useWorkflowRun` streaming hook. Added lower-level feature gating on `WorkspaceButton` and toolbar items.
- Done (2026-02-05): Wired workflow streaming into Forge inspector (plan + patch + review panel) and switched Forge workflow patch proposal to a snapshot/selection loop.
- Done (2026-02-05): Added human-readable patch summaries in the Forge workflow panel and enabled MDX rendering for how-to docs.
- Done (2026-02-05): Added `AppSpace` + `AppProviders`, removed legacy `src/shared` folder, tightened Forge workflow validation (including Start node requirement), and aligned video copilot actions with `createDomainAction`.
- Done (2026-02-05): Added `examples/consumer` Next app to validate `@forge/dev-kit` usage (AppSpace + AppProviders + Copilot runtime).
- Done: Settings persistence (Slice 1). Renamed `settings-snapshots` to `settings-overrides`; added `GET`/`POST` `/api/settings`; `SettingsHydration` in layout; explicit Save in settings sheet; store `hydrateFromOverrides` and `getOverridesForScope`.
- Done: Zustand persist replace. App-shell store persists route + lastGraphId/lastVideoDocId with rehydration gate; graph and video stores persist drafts (partialize when dirty), conditional rehydration when draft matches current doc, clear on save; removed AppShellRoutePersistence and local-storage get/set for route and lastDocIds.
- In progress: None.
- Other agents: None reported.
- Done: CopilotKit architecture doc + roadmap implementation (image gen, structured output, plan-execute-review-commit).
- Done (2026-02-06): Fixed docs sidebar keys + MDX rendering; added forge dual narrative/storylet editors, shared graph chrome + project switcher; aligned character workspace chrome and drag-drop creation; added `@forge/domain-character` to Next transpile packages and fixed project slug fallback in switchers.
- Done: Twick required; @forge/* deps in packages use workspace:* so install works without Verdaccio; lockfile updated; full VideoWorkspace + Twick CSS (studio only) restored; @twick/timeline dist/timeline.css not on npm, omitted.
- Next slice: Map Twick timeline state to our `VideoDoc` draft and add plan/commit UI for video proposals.

## Next

1. Map Twick timeline state to our `VideoDoc` draft and connect persistence (save/load).
2. Add a Video workflow panel (plan → patch → review) mirroring Forge.
3. Apply gates to more surfaces (Copilot sidebar, model selection) as needed.
4. Track any new build warnings in `docs/errors-and-attempts.md`.
5. Re-run `pnpm --filter @forge/studio build` after package updates.

**Roadmap remaining:** Vision/image input (model registry + chat upload); co-agents (documented, not used). Optional future: agent graphs/subgraphs in runtime. See [architecture/03-copilotkit-and-agents.mdx](architecture/03-copilotkit-and-agents.mdx) Section 12.

## What changed (recent)

- Twick required: internal @forge deps in packages (agent-engine, shared, dev-kit) switched to `workspace:*` so `pnpm install` works without Verdaccio; lockfile updated; full VideoWorkspace with Twick restored; only `@twick/studio/dist/studio.css` imported (npm @twick/timeline does not ship dist/timeline.css).
- Studio app moved to `apps/studio` and workspace packages to `packages/*`, including new `packages/ui` for shared shadcn atoms.
- Payload types now flow from the app config into a shared `packages/types` package.
- Docs updated to reflect single-app focus and new paths.
- Studio build succeeds (aside from unrelated Stripe resolution when lockfile/env differs); Payload emits a known dynamic import warning (documented in `docs/errors-and-attempts.md`).

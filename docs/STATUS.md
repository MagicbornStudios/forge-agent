# Status

## Current

- **Single app**: Studio lives in `apps/studio`. There is no platform/marketing app in this repo.
- **pnpm workspaces**: Root scripts filter to `@forge/studio`. Shared packages live under `packages/*`.
- **Shared UI kit**: `packages/shared/src/shared` provides WorkspaceShell, WorkspaceLayoutGrid, toolbar, overlays, and theme tokens.
- **Shared atoms**: `packages/ui` now hosts shadcn primitives used across the app and shared UI.
- **Entitlements & gates**: Capability registry + `FeatureGate` are in shared; Studio provides a local entitlements store and paywall sheet.
- **Plan UI**: Forge plans render in chat with `PlanCard` + `PlanActionBar` and `ForgePlanCard`, then review in the workspace via `WorkspaceReviewBar`.
- **Workflow runtime**: `packages/agent-engine` provides a minimal workflow engine (steps + events), SSE route at `POST /api/workflows/run`, and a streaming hook in `apps/studio/lib/ai/use-workflow-run.ts`.
- **Forge domain**: `packages/domain-forge` contains Forge logic and copilot wiring. Video remains a UI showcase under `apps/studio/lib/domains/video` (not a focus).
- **Video workspace**: `VideoWorkspace` now renders a basic Twick-inspired timeline (`TwickTimeline`) and track list (`TwickTrackList`) with add-track and add-text controls.
- **Payload + types**: Collections live in `apps/studio/payload/collections` (users, projects, forge-graphs, video-docs, settings-overrides, agent-sessions). Payload generates types into `packages/types/src/payload-types.ts`; domain aliases live in `packages/types/src/payload.ts` and `packages/types/src/graph.ts`.
- **Seeded data**: Payload seeds an admin user, a basic user, a demo graph, and a demo project on init (`apps/studio/payload/seed.ts`).
- **Settings overrides persisted**: Yes. Overrides are stored in `settings-overrides`; loaded on init via `GET /api/settings` and `hydrateFromOverrides`; saved explicitly via Save button and `POST /api/settings`.

## Ralph Wiggum loop

- Done (2026-02-04): Monorepo reorg to `apps/studio` + `packages/*`, added `packages/ui` for shared shadcn atoms, aligned imports to `@forge/ui`, updated settings to be config-based with overrides, aligned video domain types to Payload `video-docs`, added entitlements + FeatureGate + paywall, and rebuilt Studio.
- Done (2026-02-04): Added Users + Projects collections, seed data (admin + user + demo graph + demo project), and fixed payload type generation via `scripts/generate-payload-types.mjs`.
- Done (2026-02-05): Added plan field to users and `/api/me` to hydrate entitlements from the signed-in user plan.
- Done (2026-02-05): Added `PlanCard`/`PlanActionBar` + `ForgePlanCard` to render plans inline in chat.
- Done (2026-02-05): Added Twick timeline UI primitives (`TwickTimeline`, `TwickTrackList`) and wired them into VideoWorkspace.
- Done (2026-02-05): Added agent-engine workflow runtime, shared patch/workflow event types, SSE workflow route, and `useWorkflowRun` streaming hook. Added lower-level feature gating on `WorkspaceButton` and toolbar items.
- Done (2026-02-05): Wired workflow streaming into Forge inspector (plan + patch + review panel) and switched Forge workflow patch proposal to a snapshot/selection loop.
- Done (2026-02-05): Added human-readable patch summaries in the Forge workflow panel and enabled MDX rendering for how-to docs.
- Done: Settings persistence (Slice 1). Renamed `settings-snapshots` to `settings-overrides`; added `GET`/`POST` `/api/settings`; `SettingsHydration` in layout; explicit Save in settings sheet; store `hydrateFromOverrides` and `getOverridesForScope`.
- Done: Zustand persist replace. App-shell store persists route + lastGraphId/lastVideoDocId with rehydration gate; graph and video stores persist drafts (partialize when dirty), conditional rehydration when draft matches current doc, clear on save; removed AppShellRoutePersistence and local-storage get/set for route and lastDocIds.
- In progress: None.
- Other agents: None reported.
- Done: CopilotKit architecture doc + roadmap implementation (image gen, structured output, plan-execute-review-commit).
- Next slice: Expand Twick timeline editing (drag/resize elements) and add plan/commit UI for video proposals.

## Next

1. Wire the workflow stream into Forge UI (plan/proposal preview panel) and replace stub patch generation with a tool loop based on graph snapshot + selection.
2. Keep `pnpm payload:types` in sync with collection changes (do this after any Payload edits).
3. Apply gates to more surfaces (Copilot sidebar, model selection) as needed.
4. Track any new build warnings in `docs/errors-and-attempts.md`.
5. Re-run `pnpm --filter @forge/studio build` to confirm (CopilotKit action render fix: `ImageGenerateRender` / `StructuredOutputRender` now return `<></>` instead of `null`).

**Roadmap remaining:** Vision/image input (model registry + chat upload); co-agents (documented, not used). Optional future: agent graphs/subgraphs in runtime. See [architecture/copilotkit-and-agents.md](docs/architecture/copilotkit-and-agents.md) Section 12.

## What changed (recent)

- Studio app moved to `apps/studio` and workspace packages to `packages/*`, including new `packages/ui` for shared shadcn atoms.
- Payload types now flow from the app config into a shared `packages/types` package.
- Docs updated to reflect single-app focus and new paths.
- Studio build succeeds; Payload emits a known dynamic import warning (documented in `docs/errors-and-attempts.md`).

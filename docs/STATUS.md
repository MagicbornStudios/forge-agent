# Status

## Current

- **Single app**: Studio lives in `apps/studio`. There is no platform/marketing app in this repo.
- **pnpm workspaces**: Root scripts filter to `@forge/studio`. Shared packages live under `packages/*`.
- **Shared UI kit**: `packages/shared/src/shared` provides WorkspaceShell, WorkspaceLayoutGrid, toolbar, overlays, and theme tokens.
- **Shared atoms**: `packages/ui` now hosts shadcn primitives used across the app and shared UI.
- **Entitlements & gates**: Capability registry + `FeatureGate` are in shared; Studio provides a local entitlements store and paywall sheet.
- **Forge domain**: `packages/domain-forge` contains Forge logic and copilot wiring. Video remains a UI showcase under `apps/studio/lib/domains/video` (not a focus).
- **Payload + types**: Collections live in `apps/studio/payload/collections` (users, projects, forge-graphs, video-docs, settings-overrides, agent-sessions). Payload generates types into `packages/types/src/payload-types.ts`; domain aliases live in `packages/types/src/payload.ts` and `packages/types/src/graph.ts`.
- **Seeded data**: Payload seeds an admin user, a basic user, a demo graph, and a demo project on init (`apps/studio/payload/seed.ts`).
- **Settings overrides persisted**: Yes. Overrides are stored in `settings-overrides`; loaded on init via `GET /api/settings` and `hydrateFromOverrides`; saved explicitly via Save button and `POST /api/settings`.

## Ralph Wiggum loop

- Done (2026-02-04): Monorepo reorg to `apps/studio` + `packages/*`, added `packages/ui` for shared shadcn atoms, aligned imports to `@forge/ui`, updated settings to be config-based with overrides, aligned video domain types to Payload `video-docs`, added entitlements + FeatureGate + paywall, and rebuilt Studio.
- Done (2026-02-04): Added Users + Projects collections, seed data (admin + user + demo graph + demo project), and fixed payload type generation via `scripts/generate-payload-types.mjs`.
- Done: Settings persistence (Slice 1). Renamed `settings-snapshots` to `settings-overrides`; added `GET`/`POST` `/api/settings`; `SettingsHydration` in layout; explicit Save in settings sheet; store `hydrateFromOverrides` and `getOverridesForScope`.
- In progress: None.
- Other agents: None reported.
- Done: CopilotKit architecture doc + roadmap implementation (image gen, structured output, plan–execute–review–commit).
- Next slice: Apply gates to more surfaces (Copilot sidebar, model selection) and add a simple dev toggle for plan/overrides.

## Next

1. Keep `pnpm payload:types` in sync with collection changes (do this after any Payload edits).
2. Apply gates to more surfaces (Copilot sidebar, model selection) as needed.
3. Track any new build warnings in `docs/errors-and-attempts.md`.
4. Re-run `pnpm --filter @forge/studio build` (previous attempt timed out at ~2m).

## What changed (recent)

- Studio app moved to `apps/studio` and workspace packages to `packages/*`, including new `packages/ui` for shared shadcn atoms.
- Payload types now flow from the app config into a shared `packages/types` package.
- Docs updated to reflect single-app focus and new paths.
- Studio build succeeds; Payload emits a known dynamic import warning (documented in `docs/errors-and-attempts.md`).

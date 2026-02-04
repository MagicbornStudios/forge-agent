# Status

## Current

- **Single app**: Studio lives in `apps/studio`. There is no platform/marketing app in this repo.
- **pnpm workspaces**: Root scripts filter to `@forge/studio`. Shared packages live under `packages/*`.
- **Shared UI kit**: `packages/shared/src/shared` provides WorkspaceShell, WorkspaceLayoutGrid, toolbar, overlays, and theme tokens.
- **Forge domain**: `packages/domain-forge` contains Forge logic and copilot wiring. Video remains a UI showcase under `apps/studio/lib/domains/video` (not a focus).
- **Payload + types**: Collections live in `apps/studio/payload/collections`. Payload generates types into `packages/types/src/payload-types.ts`; domain aliases live in `packages/types/src/payload.ts` and `packages/types/src/graph.ts`.

## Ralph Wiggum loop

- Done (2026-02-04): Monorepo reorg to `apps/studio` + `packages/*`, updated imports to `@forge/*`, aligned Payload type generation into `packages/types`, fixed build errors (shared utils, resizable panels API, workspace index exports), and rebuilt Studio.
- In progress: None.
- Other agents: None reported.
- Next slice: Decide shared UI atoms packaging vs. app-local atoms, then align shared imports accordingly.

## Next

1. Keep `pnpm payload:types` in sync with collection changes (do this after any Payload edits).
2. Decide whether to formalize a shared UI atoms package or continue using Studio atoms in shared components.
3. Track any new build warnings in `docs/errors-and-attempts.md`.

## What changed (recent)

- Studio app moved to `apps/studio` and workspace packages to `packages/*`.
- Payload types now flow from the app config into a shared `packages/types` package.
- Docs updated to reflect single-app focus and new paths.
- Studio build succeeds; Payload emits a known dynamic import warning (documented in `docs/errors-and-attempts.md`).

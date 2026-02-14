# Errors and Attempts

## 2026-02-13

- [x] RepoStudio env actions could fail with `'forge-env' is not recognized` on Windows.
  - Attempt: direct binary invocation from server APIs.
  - Resolution: added shared command resolver fallback chain (local package CLI -> `pnpm run` -> `pnpm exec` -> direct bin) with attempt diagnostics.
- [x] RepoStudio app parity trailed package runtime parity for dock/settings/assistant integration.
  - Resolution: completed Phase 02 Plan 03 panel/store/settings refactor and moved forward with Phase 03 codex/review-queue/file API parity work.
- [x] `@forge/repo-studio-app` build failed on shared showcase typing + missing Dockview dep:
  - File: `packages/shared/src/shared/components/docs/showcase/demos/registry.generated.tsx`
  - Error: generated module typing expected `.default` property on named exports; `apps/repo-studio` had no direct `dockview` dependency.
  - Resolution: updated `scripts/build-showcase-registry.mjs` + regenerated registry file, added `dockview` dep, and revalidated `pnpm --filter @forge/repo-studio-app build`.

## 2026-02-14

- [x] RepoStudio detached runtime output was inconsistent when launched via `open`.
  - Attempt: rely on stdout JSON from detached launcher.
  - Resolution: emit `open`/`portal` status lines to stderr-safe path, add runtime state fallback (`.repo-studio/runtime.json`), and validate via `status`.
- [x] RepoStudio `stop` reported success but `status` could still show running on Windows.
  - Attempt: rely on `process.kill(pid, 0)` for liveness checks.
  - Resolution: switched Windows liveness checks to `tasklist`, added runtime-port binding validation (`pid` must also own the tracked listening port), and validated `status -> stop -> status` transition.
- [x] RepoStudio app builds emitted Dockview dependency warnings (`Can't resolve dockview CSS` in drifted installs and bundler warning around dynamic resolver usage).
  - Attempt: ad-hoc `createRequire` resolution in app route.
  - Resolution: added deterministic filesystem-based dependency health checks, exposed `/api/repo/runtime/deps`, extended `forge-repo-studio doctor`, and centralized editor style imports via `packages/shared/src/shared/styles/editor-surface.css`.
- [x] RepoStudio app failed with `Can't resolve 'tw-animate-css'` from `apps/repo-studio/app/globals.css`.
  - Attempt: rely on workspace hoisting from other apps.
  - Resolution: added app-local dependency declarations (`tw-animate-css`, `tailwindcss-animate`) plus app-local `tailwindcss` dev dependency in `apps/repo-studio/package.json`, then revalidated `pnpm --filter @forge/repo-studio-app build`.
- [x] RepoStudio codex session manager initially failed TypeScript strict build (`messageToText` implicit return type recursion).
  - Attempt: recursive parser helper without explicit return type.
  - Resolution: added explicit `: string` return type and reran `pnpm --filter @forge/repo-studio-app build`.
- [x] RepoStudio env doctor panel remained raw-text-first despite JSON-capable backend.
  - Attempt: parse text report only.
  - Resolution: switched API route to `forge-env doctor --json` and rendered structured missing/conflict/warning/discovery cards while retaining raw output panel.
- [x] RepoStudio Story workspace failed type-check with `Cannot redeclare block-scoped variable 'createPage'`.
  - Attempt: reused `createPage` for both state and callback function.
  - Resolution: split into explicit `createPageIndex` state and `createCanonicalPage` callback, then revalidated `pnpm --filter @forge/repo-studio-app build`.
- [x] Loop assistant route could dead-end when configured with relative `/api/assistant-chat` path.
  - Attempt: proxy-only endpoint resolution requiring absolute URL caused local route recursion risk and unavailable loop-assistant behavior.
  - Resolution: added local shared-runtime loop-assistant fallback stream path and route-mode-aware endpoint resolver logic.
- [ ] `forge-loop verify-work 03 --strict` still reports two failing automated checks unrelated to RepoStudio deltas.
  - Failure 1: `pnpm --filter @forge/studio build` fails on existing parse/lint issues (e.g. `components/editors/StrategyEditor.tsx` JSX closing tag mismatch).
  - Failure 2: `pnpm --filter @forge/studio test -- --runInBand` fails due missing native `canvas.node` binding in current local environment.
  - Next step: address upstream `@forge/studio` build/test baseline, then rerun strict phase verification.

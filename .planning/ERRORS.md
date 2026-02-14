# Errors and Attempts

## 2026-02-13

- [x] RepoStudio env actions could fail with `'forge-env' is not recognized` on Windows.
  - Attempt: direct binary invocation from server APIs.
  - Resolution: added shared command resolver fallback chain (local package CLI -> `pnpm run` -> `pnpm exec` -> direct bin) with attempt diagnostics.
- [ ] RepoStudio app parity still trails package runtime parity for dock/settings/assistant integration.
  - Next: execute Phase 02 Plan 03 tasks in `apps/repo-studio` using shared Studio primitives.
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

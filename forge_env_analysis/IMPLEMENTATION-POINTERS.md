# Forge Env Implementation Pointers

Env workspace is canonical. Build features there; do not embed legacy portal.

## Phase A: Env Workspace Feature Parity

- **Discovery**: `packages/forge-env/src/lib/discovery.mjs` — `workspaceGlobs`, `DEFAULT_WORKSPACE_GLOBS`; add vendor or make configurable
- **Profiles**: `packages/forge-env/src/lib/profiles.mjs` — `buildForgeAgentProfile`, `buildForgeLoopProfile`; `discovery.workspaceGlobs`
- **Scope tags**: Extend target model to include scope (package | app | vendor | root) from dir path or config
- **Env workspace**: `apps/repo-studio/src/components/features/env/EnvWorkspace.tsx` — add per-target key editors; Save/Refresh; copy-paste (parse KEY=VALUE)
- **API**: See [API-CONTRACT.md](API-CONTRACT.md). Routes:
  - `GET /api/env/target/:targetId` — read all keys (including empty), scoped to mode, with provenance
  - `POST /api/env/target/:targetId` — write values for mode; validate after; return readiness
- **Engine**: Reuse `collectProjectState`, `writeTargetFiles`, `evaluateReadiness` from `packages/forge-env/src/lib/engine.mjs`. Writers use mode → file mapping (local→.env.local, preview→.env.development.local, production→.env.production.local).

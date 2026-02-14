# Forge Env Implementation Pointers

Env workspace is canonical. Build features there; do not embed legacy portal.

## Phase A: Env Workspace Feature Parity

- **Discovery**: `packages/forge-env/src/lib/discovery.mjs` — `workspaceGlobs`, `DEFAULT_WORKSPACE_GLOBS`; add vendor or make configurable
- **Profiles**: `packages/forge-env/src/lib/profiles.mjs` — `buildForgeAgentProfile`, `buildForgeLoopProfile`; `discovery.workspaceGlobs`
- **Scope tags**: Extend target model to include scope (package | app | vendor | root) from dir path or config
- **Env workspace**: `apps/repo-studio/src/components/features/env/EnvWorkspace.tsx` — add per-target key editors; Save/Refresh; copy-paste (parse KEY=VALUE)
- **API**: Need API route(s) to read/write env per target (forge-env engine logic; not portal HTML). See `packages/forge-env/src/lib/engine.mjs`, portal POST handler for form payload → reconcile

# Forge Env Findings

## 1. Current State

### forge-env CLI
- Commands: init, doctor, portal, reconcile, diff, sync-examples
- Profiles: forge-agent, forge-loop, custom
- Modes: local, preview, production, headless
- Discovery: reads pnpm-workspace.yaml globs (default apps/*, packages/*); finds dirs with .env* files
- Targets: manifest (studio, platform) + discovered packages with env files
- **Vendor**: Not in default workspace globs; discovery uses pnpm packages; vendor/ typically not a pnpm workspace

### forge-env Portal (legacy, not maintained)
- Standalone HTML served by `forge-env portal`
- Tabs: Missing Required, Conflicts, Targets, Headless Readiness
- Per-target editors: key inputs with Save/Refresh
- **Not used or embedded**; Repo Studio Env workspace is canonical

### Repo Studio Env Workspace (canonical)
- Profile and mode selectors (text input + Select)
- Doctor and Reconcile buttons; output in `<pre>`
- Doctor Snapshot: missing/conflicts/warnings tables
- Runtime Dependency Health card
- **Gap**: No per-key editing; no copy-paste; needs feature parity with portal concepts (target editors, Save/Refresh)

## 2. Gaps

| Gap | Current | Target |
|-----|---------|--------|
| Vendor scope | Not in default discovery | Include vendor/* in discovery or explicit config |
| Copy-paste | None | Paste from clipboard into target/mode inputs |
| Scope selector | Implicit in targets | Explicit package/app/vendor/root filter in UI |
| Mode-scoped inputs | Portal shows keys; mode from URL | Clear local vs dev vs prod per target |
| Unified UI | Env workspace is doctor-only | Full env management in Env workspace |
| Paste from selection | N/A | User selects .env text; paste parses and fills |

## 3. Recommendations

- Add `vendor/*` to discovery config or profile `workspaceGlobs` when vendor has env needs
- Env workspace: per-target key editors, Save/Refresh, "Paste from .env" (parse KEY=VALUE, fill inputs)
- Scope labels: tag each target as package | app | vendor | root for filtering

## 4. Doppler / dotenv-vault Research

- **Doppler**: Vault, sync, RBAC, CLI. API/CLI patterns to study for sync and pull.
- **dotenv-vault**: `.env.vault` format, encryption, `dotenv-vault pull`. Local encryption without vendor infra.
- **What to rebuild**: Vault/encryption (dotenv-vault), sync/pull concepts (Doppler), scoped inheritance (both). Org-wide RBAC is out of scope for monorepo-first.

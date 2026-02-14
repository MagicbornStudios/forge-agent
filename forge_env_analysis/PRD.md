# Forge Env Product Requirements Document

## Vision

Forge Env as the canonical environment-variable and scope management system for the monorepo. Supports copy-paste workflows, clear scoping (package/app/vendor, local/dev/prod). **Repo Studio Env workspace is the canonical env UI**—no standalone portal to maintain; no embedding of legacy portal.

## Relationship to Repo Studio

- **Repo Studio Env workspace** is the only env UI we maintain. It must provide full env management: Doctor, Reconcile, per-key editing, copy-paste, scope visibility.
- **Legacy forge-env portal** (standalone HTML on port 3847): exists but is not used or embedded. Deprecate in favor of Env workspace features.

## Terminology

| Term | Meaning |
|------|---------|
| **Target** | A dir with .env* files (root, apps/studio, packages/foo, etc.) |
| **Profile** | forge-agent, forge-loop, custom—defines manifest entries and discovery |
| **Mode** | local, preview, production, headless—defines required keys |
| **Scope** | package | app | vendor—which workspace category a target belongs to |

## Scope

- Env var discovery across monorepo (apps, packages, vendor)
- Per-target and per-mode key management
- Copy-paste: paste from clipboard or selection into target/mode inputs
- Scoping: package, app, vendor (and root)
- UI: embedded in Repo Studio or improved portal; same capabilities

## Non-Scope

- Replacing dotenv or env file format
- Sync to main Forge Loop; user handles when ready

## Doppler / dotenv-vault Parity (Aspirational)

User wants to "rebuild as much of them" as feasible:

- **Doppler**: Vault, sync, RBAC, CLI, dashboards—org-wide secrets. We focus on monorepo per-target; borrow sync/pull concepts.
- **dotenv-vault**: Encrypted `.env`, `.env.vault`, pull command. Vault/encryption for sensitive keys is a candidate.
- **Phase B+**: Encryption for secrets; sync/pull for shared config; scoped inheritance.

## Features

| ID | Feature | Status | Phase |
|----|---------|--------|-------|
| F1 | Vendor scope in discovery | Planned | A |
| F2 | Copy-paste (paste from .env/clipboard into inputs) | Planned | A |
| F3 | Scope selector (package/app/vendor/root) in UI | Planned | A |
| F4 | Mode-scoped inputs (local vs dev vs prod) | Planned | A |
| F5 | Per-key editing in Env workspace | Planned | A |
| F6 | Unified env surface (all targets in one workspace) | Planned | A |

## Phasing

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **A** | Env workspace feature parity | Per-key editing; copy-paste; scoping; mode per target; vendor in discovery |

## API Contract (Phase A)

See [API-CONTRACT.md](API-CONTRACT.md).

- **Read**: `GET /api/env/target/:targetId` — all keys (including empty), provenance, scoped to mode.
- **Write**: `POST /api/env/target/:targetId` — values for mode; validate after; return readiness.
- Single target per request; mode determines file (.env.local, .env.development.local, .env.production.local).
- Plain text (no masking).

## UI Layout (Phase A)

TBD: tabs vs cards vs accordion for targets. Default: tabs for now; can refine.

## Dependencies

- forge-env CLI (packages/forge-env)
- Repo Studio (for embed target)
- pnpm-workspace.yaml for discovery

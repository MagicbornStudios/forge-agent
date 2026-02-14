# Phase 02 Context: RepoStudio Command Center

## Goal

Build a reusable RepoOps command center that unifies env management, safe script execution, Forge Loop analytics, and assistant operations while keeping `.planning` as canonical state.

## Scope

- Harden `@forge/forge-env` internals and discovery behavior.
- Deliver `@forge/repo-studio` package and monorepo app shell.
- Integrate Forge Loop headless preflight with RepoStudio-first launch preference.
- Publish complete runbooks for humans and coding agents.
- Keep nonstop Ralph loop cadence visible in RepoStudio (`progress -> discuss -> plan -> execute -> verify -> progress -> sync`).

## Guardrails

- Implementation target is `forge-agent` only.
- `repomirror` remains reference-only.
- Right sidebar in Studio surfaces is reserved for settings/codegen flows.
- Primary RepoStudio operations live in main workspace tabs (`Forge Loop`, `Env`, `Commands`, `Docs`, `Assistant`).

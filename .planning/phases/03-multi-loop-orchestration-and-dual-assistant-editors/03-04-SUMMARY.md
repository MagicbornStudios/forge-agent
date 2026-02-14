# Phase 03: Multi-loop orchestration and dual-assistant editors - Plan 04 Summary

## Outcomes

- Completed strict assistant route split in RepoStudio app runtime:
  - `editorTarget=loop-assistant` now uses local shared-runtime behavior by default.
  - `editorTarget=codex-assistant` remains Codex app-server-first with explicit exec fallback toggle.
- Added local loop-assistant runtime stream path to prevent proxy recursion and keep non-Codex assistance available in repo-only mode.
- Hardened Story domain implementation and scope-safe APIs:
  - Story tree/page/read/save/create/reader endpoints.
  - Scope override token lifecycle endpoints (`start`, `stop`, `status`).
  - Scope enforcement integrated into file and proposal apply/approval paths.
- Added Git core operations APIs and in-app Git workspace:
  - status, branches, create/switch branch, stage, restore, commit, history.
- Wired Story + Git as first-class RepoStudio dock panels and aligned panel specs/store state contracts.
- Kept `@forge/repo-studio-app` type/build healthy while preserving approval-gated apply flow and review queue behavior.

## Validation

- `pnpm --filter @forge/repo-studio-app build`
- `pnpm --filter @forge/repo-studio test`
- `pnpm --filter @forge/forge-loop test`
- `pnpm forge-loop progress --json`
- `pnpm forge-loop verify-work 03 --non-interactive --strict` (runs; fails on pre-existing `@forge/studio` lint/test environment issues unrelated to RepoStudio deltas)

## Follow-up

- Open Phase `04-story-domain-codex-writer` for Story domain productionization:
  - domain-scoped Codex UX,
  - reusable scoped diff flows (`story` + `planning` presets),
  - richer Tool UI carding for loop/codex workflows,
  - docs/runbook hardening for story-first usage.

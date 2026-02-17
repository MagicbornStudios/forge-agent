# Analysis References

Source map for planning decisions ingested on 2026-02-15. These analysis artifacts remain independent from `.planning`; this file tracks traceability only.

## Primary Sources

| Source | Focus | Used By |
|---|---|---|
| `repo_studio_analysis/PRD.md` | RepoStudio product scope, A-E phase shape, workspace model, desktop direction | REQ-17, REQ-19, REQ-21, REQ-22, REQ-23; Phases 05-09 |
| `repo_studio_analysis/DECISIONS.md` | Settings persistence, story publish model, workspace/editor parity, trust/approval policy | REQ-17, REQ-18, REQ-19, REQ-21; Phases 05-07 |
| `repo_studio_analysis/DECISIONS-WORKSPACE-PANELS.md` | Panel/menu/layout contracts, per-workspace contributions, navigator/diff/review decisions | REQ-19, REQ-20; Phases 06-07 |
| `forge_env_analysis/API-CONTRACT.md` | Target-scoped env read/write API contract and mode-to-file mapping | REQ-18; Phase 05 |
| `ide_navigation_analysis/DECISIONS.md` | Navigator-first generic panel, server search, no default excludes policy | REQ-20; Phase 06 |

## Secondary Inputs

| Source | Focus | Used By |
|---|---|---|
| `repo_studio_analysis/PLANNING-EXECUTION-LOOP.md` | GSD planning + Ralph loop execution orchestration model | Phase 04 closeout, Phases 05-09 cadence |
| `repo_studio_analysis/WORKSPACE-AUDIT.md` | Existing workspace panel gap analysis | Phase 04 completion checks; Phase 06 planning |
| `repo_studio_analysis/GAPS.md` | Studio parity and implementation gaps | Phase 04 and Phase 06 backlog shaping |
| `forge_env_analysis/PRD.md` | Env workspace goals and parity expectations | Phase 05 plan decomposition |
| `forge_env_analysis/GAPS.md` | Missing env UX/API parity and data-shape gaps | Phase 05 plan decomposition |
| `ide_navigation_analysis/FINDINGS.md` | Navigation/search implementation findings | Phase 06 plan decomposition |
| `https://developers.openai.com/codex/app-server` | Codex app-server protocol and session semantics | Phase 12 runner transport and readiness contracts |
| `https://developers.openai.com/codex/sdk` | Codex SDK capability reference used for transport tradeoff decisions | Phase 12 non-SDK decision justification |

## Traceability Rules

- Use this file as reference index; do not duplicate full analysis content into `.planning`.
- When a requirement or plan references analysis input, link to source path and summarize only implementation implications.
- Keep source documents unchanged unless analysis loops are explicitly reopened.

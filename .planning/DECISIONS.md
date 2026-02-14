# Decisions

## 2026-02-13

- [x] RepoStudio remains package-first with CLI/runtime (`forge-repo-studio open|doctor|run`) and keeps `--legacy-ui` as fallback.
- [x] RepoStudio command execution uses allowlist + confirm + per-command local disable overrides (`.repo-studio/local.overrides.json`).
- [x] Forge Loop workspace in RepoStudio consumes `forge-loop progress --json` and `.planning` analytics for next-action routing.
- [ ] Studio-grade app parity (dock layouts, settings/codegen parity, shared assistant panel reuse) is tracked as Phase 02 Plan 03.

## 2026-02-14

- [x] RepoStudio runtime lifecycle is controlled by `.repo-studio/runtime.json` plus `forge-repo-studio status|stop`, with port-based recovery for stale/untracked processes.
- [x] `forge-env portal` delegates to `forge-repo-studio open --view env --reuse` and reports URL/PID/runtime mode.
- [x] RepoStudio app runtime defaults to planning-first workspace with manual planning-doc attachment context for assistant conversations.
- [x] RepoStudio codex mode is hybrid CLI + SDK-style adapter and enforces `chatgpt-strict` auth policy before codex execution.
- [x] Forge Loop remains agent-agnostic while Forge Env/RepoStudio carry runner-specific readiness and codex-first operational guidance.
- [x] Dockview/style dependency checks are now first-class health contracts (`/api/repo/runtime/deps` and `forge-repo-studio doctor --json`) with shared `editor-surface.css` imports across Studio + RepoStudio.

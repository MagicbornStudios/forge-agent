# Decisions

## 2026-02-13

- [x] RepoStudio remains package-first with CLI/runtime (`forge-repo-studio open|doctor|run`) and keeps `--legacy-ui` as fallback.
- [x] RepoStudio command execution uses allowlist + confirm + per-command local disable overrides (`.repo-studio/local.overrides.json`).
- [x] Forge Loop workspace in RepoStudio consumes `forge-loop progress --json` and `.planning` analytics for next-action routing.
- [x] Studio-grade app parity (dock layouts, settings/codegen parity, shared assistant panel reuse) is tracked and delivered through Phase 02 Plan 03.

## 2026-02-14

- [x] RepoStudio runtime lifecycle is controlled by `.repo-studio/runtime.json` plus `forge-repo-studio status|stop`, with port-based recovery for stale/untracked processes.
- [x] `forge-env portal` delegates to `forge-repo-studio open --view env --reuse` and reports URL/PID/runtime mode.
- [x] RepoStudio app runtime defaults to planning-first workspace with manual planning-doc attachment context for assistant conversations.
- [x] RepoStudio codex mode is hybrid CLI + SDK-style adapter and enforces `chatgpt-strict` auth policy before codex execution.
- [x] Forge Loop remains agent-agnostic while Forge Env/RepoStudio carry runner-specific readiness and codex-first operational guidance.
- [x] Dockview/style dependency checks are now first-class health contracts (`/api/repo/runtime/deps` and `forge-repo-studio doctor --json`) with shared `editor-surface.css` imports across Studio + RepoStudio.
- [x] Forge Loop multi-loop model is hybrid index + loop dirs (`.planning/LOOPS.json` + `.planning/loops/<loop-id>`), with lifecycle loop selection via `--loop`.
- [x] RepoStudio assistant model is dual-editor (`loop-assistant`, `codex-assistant`) with editor-targeted routing and codex app-server-first readiness checks.
- [x] RepoStudio diff tooling is read-first (Monaco diff + attach-to-assistant context) with write/apply still approval-gated and CLI-led.
- [x] RepoStudio codex assistant route now streams AI SDK UI message events and maps codex approval requests into a persisted review queue (`.repo-studio/proposals.json`) before any apply action.
- [x] RepoStudio code editing path stays manual-write by default with explicit approval flag (`approved=true`) and separate assistant proposal apply/reject actions.
- [x] Package runtime exposes codex session/turn/proposal/file contract endpoints for compatibility, while app runtime remains the full-parity primary path.
- [x] Loop assistant and Codex assistant are hard-separated by `editorTarget`; loop assistant never auto-falls into codex mode.
- [x] RepoStudio now provides a local shared-runtime loop-assistant fallback for repo-only operation when no external proxy endpoint is configured.
- [x] Story domain defaults are locked to `content/story` with hard scope policy and explicit TTL scope override tokens.
- [x] Story and Git workflows are first-class dock panels in RepoStudio and remain approval-gated for assistant-generated writes.

# Project State

## Current Position

Phase: 15
Plan: 15-01
Status: Execution in progress
Last activity: 2026-02-27 - Release cut in progress: platform/docs gates fixed, strict desktop standalone packaging gate added, release workflow added

## Execution

- Active phase: Strategic shift - Repo Studio + Platform focus
- Active plan: 15-01 (Master plan - execute shift in tracked slices)
- Active task: FRG-1526 Forge Agent release push cut (single commit to main + v0.1.1 tag + release verification)

## Strategic shift (Phase 15)

- **Goal:** Archive Studio app; move Character and Dialogue to studio examples in RepoStudio-Extensions; move consumer-studio to `assistant-only` studio example; deprecate forge graphs and Yarn Spinner dialogue on platform; platform supports Repo Studio first.
- **Process:** Loop (discuss -> plan -> execute -> verify); PRD, phases, tasks, decisions in .planning. See `.planning/phases/15-strategic-shift-repo-studio-platform-focus/` (CONTEXT, PRD, 15-01-PLAN).
- **Next:** Complete FRG-1526/1527 by pushing forge-agent `main`, tagging `v0.1.1`, and verifying GitHub release assets; then resume archive/rescope tasks (FRG-1501/1502/1504/1506).

## Repo Studio dev DB

- `pnpm dev:repo-studio` runs `db:reset-dev` then Next + Drizzle Studio. Dev DB is wiped each run so Payload recreates tables (no "create or rename?" prompt). Payload owns schema; Drizzle is pull-only. See docs/agent-artifacts/core/decisions.md and errors-and-attempts.md.

## Repo Studio root and toolbars

- Root component is **RepoStudioRoot** (was RepoStudioShell); workspaces are imported via `@/components/workspaces` and extension kinds are rendered via `@forge/repo-studio-extension-adapters`. ActiveLayout = active workspace component. App identity (APP_ID, APP_LABEL) is in app-spec.generated.ts; root applies data-app-id and aria-label from spec.

## Planning workspace layout

- Planning workspace: Left = Phases | Tasks | Documents (three panels); Main = viewport with one tab per opened planning doc. PlanningDocListPanel in left Documents panel; PlanningDocPagePanel in each viewport tab. Viewport state is per loop (`layoutId::loop::activeLoopId`); selectedDocId syncs on open/active change for Copy @ and Assistant.

## Viewport tab bar wheel scroll

- WorkspaceViewport tab bar: vertical mouse wheel scrolls tabs horizontally. Implemented with native `addEventListener('wheel', ..., { passive: false })` in useEffect (not React onWheel) to avoid passive-listener preventDefault warnings.

## Extension-first workspace state

- Built-in generated workspace ids exclude `story` and `env`; both are extension-driven.
- Repo Studio loads extensions from active project root at `.repo-studio/extensions` via `/api/repo/extensions`.
- Legacy route/workspace id `env` is aliased to installed `env-workspace` when available; otherwise it sanitizes to `planning`.
- Forge tool proof for extension AI readiness is `forge_open_about_workspace` (active workspace only).

## Repo Studio product hard cut state

- Built-in generated workspace ids are now exactly `planning`, `extensions`, `database`, `git`, `code`.
- Assistant is not a standalone workspace; it is a right-rail panel in all built-in workspaces with global show/hide behavior.
- Terminal is not workspace-local; File menu launches a global multi-session bottom dock (`shell`, `codex`, `claude` profiles).
- Planning exposes first-class PRD/status/decisions/regression panels with canonical PRD contract at `.planning/PRD.md`.
- Git operations resolve executable via shared resolver (`REPO_STUDIO_GIT_PATH` -> bundled Windows path -> system `git`).

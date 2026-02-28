# Project State

## Current Position

Phase: 15
Plan: 15-01
Status: Execution in progress
Last activity: 2026-02-28 - FRG-1534 reliability cut in progress: release workflow now appends desktop smoke status into the GitHub Release body (status badge block), persists smoke summary markdown as an artifact, and keeps local `desktop:smoke:diff` tooling for run-to-run regression comparison

## Execution

- Active phase: Strategic shift - Repo Studio + Platform focus
- Active plan: 15-01 (Master plan - execute shift in tracked slices)
- Active task: FRG-1534 Fix post-publish desktop readiness defects (CI guard relax + installer/runtime hardening closeout)

## Strategic shift (Phase 15)

- **Goal:** Archive Studio app; move Character and Dialogue to studio examples in RepoStudio-Extensions; move consumer-studio to `assistant-only` studio example; deprecate forge graphs and Yarn Spinner dialogue on platform; platform supports Repo Studio first.
- **Process:** Loop (discuss -> plan -> execute -> verify); PRD, phases, tasks, decisions in .planning. See `.planning/phases/15-strategic-shift-repo-studio-platform-focus/` (CONTEXT, PRD, 15-01-PLAN).
- **Next:** Resume archive/rescope tasks (FRG-1501/1502/1504/1506) and continue Phase 15 strategic-shift cleanup. **Phase 16** (Repo Studio canonical submodule) is planned: 16-01 add submodule and verify, 16-02 switch to build from submodule; see `.planning/phases/16-repo-studio-canonical-submodule/` and ROADMAP. **Phase 17** (Platform submodule and docs deploy) is planned: platform in RepoStudio-Platform repo and as submodule (vendor/platform), docs and platform on Vercel, deployment matrix; see `.planning/phases/17-platform-submodule-docs-deploy/` and ROADMAP. **Phase 18** (Platform integration gateway) is planned: Open Router proxy, extension install proxy, capability flags; see `.planning/phases/18-platform-integration-gateway/` and [.planning/PLATFORM-PRD.md](.planning/PLATFORM-PRD.md). **Phase 19** (Planning assistant context and tools): loopId/workspaceId/selectedDocId, plan Forge tools, optional LangGraph; see `.planning/phases/19-planning-assistant-context-and-tools/`. **Phase 20** (Planning artifacts first-class — DoD, HUMAN-TASKS, panels, unified todos) is planned: DoD and HUMAN-TASKS in snapshot and panels, unified my-todos vs agent-tasks view, optional on-load Codex prompt; see `.planning/phases/20-planning-artifacts-and-todos-in-repo-studio/`. **Phase 21** (Artifact layout and loop efficiency — planning) is planned: layout and loop efficiency decisions only; see `.planning/phases/21-artifact-layout-and-loop-efficiency/`. **Phase 22** (Workspace and panel design refactor) is planned: chat-in-chat, fewer rails, tree + context menu; see `.planning/phases/22-workspace-and-panel-design-refactor/`. **Phase 23** (Repo review and cleanup) is planned: GSD/Cursor setup, analysis consolidation, layout and legacy; see `.planning/phases/23-repo-review-and-cleanup/`. Human-only setup (repos, env, Vercel, npm, OAuth) is tracked in [.planning/HUMAN-TASKS.md](.planning/HUMAN-TASKS.md); agents check there before blocking.

## Planning artifact update and release execution

- **Planning artifact update (2026-02):** Phases 16–18, [.planning/PLATFORM-PRD.md](.planning/PLATFORM-PRD.md), [.planning/HUMAN-TASKS.md](.planning/HUMAN-TASKS.md), ROADMAP, TASK-REGISTRY, DECISIONS, 15-PRD, and [docs/18-agent-artifacts-index.mdx](docs/18-agent-artifacts-index.mdx) were updated as part of the **Platform phases and human-todos** initiative. These changes are intentional and in scope.
- **Release execution when planning docs are modified:** If an agent (e.g. Codex) runs release execution and finds uncommitted changes in `.planning/**` or related docs, it may: **(A)** Commit planning docs in a **separate commit first** (e.g. `chore(planning): Phase 18, PLATFORM-PRD, HUMAN-TASKS; Phase 19 planning-assistant`), then proceed with the release commit (tag, workflow, STATE/ERRORS/DECISIONS). **(B)** Or include all current planning and release-related changes in the same commit if a single combined commit is preferred. Do not block release indefinitely on "unexpected" planning changes; treat them as reconcilable.
- **PRD per loop:** Each loop's planning root may have PRD.md (see [.planning/DEFINITION-OF-DONE.md](.planning/DEFINITION-OF-DONE.md)). Stage DoD (Planning, Execution, Review, PRD scope) is defined there.

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

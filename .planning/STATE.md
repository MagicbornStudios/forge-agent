# Project State

## Current Position

Phase: 14
Plan: 14-04
Status: In progress
Last activity: 2026-02-25T22:55:00.000Z - Unified Repo Studio assistant/runtime model routing, wired GitHub OAuth device flow, added project manager APIs, and routed git/files/diff/search through active project root

## Execution

- Active phase: AI/chat-first hard-cut and consumer studio reference
- Active plan: 14-04
- Active task: Verification pass + artifact sync for Phase 14 closeout

## Repo Studio dev DB

- `pnpm dev:repo-studio` runs `db:reset-dev` then Next + Drizzle Studio. Dev DB is wiped each run so Payload recreates tables (no "create or rename?" prompt). Payload owns schema; Drizzle is pull-only. See docs/agent-artifacts/core/decisions.md and errors-and-attempts.md.

## Repo Studio root and toolbars

- Root component is **RepoStudioRoot** (was RepoStudioShell); workspaces are imported via `@/components/workspaces` → REPO_WORKSPACE_COMPONENTS; ActiveLayout = active workspace component. Toolbars live inside workspaces (PlanningWorkspace, StoryWorkspace render WorkspaceToolbar then WorkspaceLayout). App identity (APP_ID, APP_LABEL) is in app-spec.generated.ts; root applies data-app-id and aria-label from spec.

## Planning workspace layout

- Planning workspace: Left = Phases | Tasks | Documents (three panels); Main = viewport with one tab per opened planning doc (like Story). PlanningDocListPanel in left Documents panel; PlanningDocPagePanel in each viewport tab. Viewport state per loop (`layoutId::loop::activeLoopId`); selectedDocId synced on open/active change for Copy @ and Assistant.

## Viewport tab bar wheel scroll

- WorkspaceViewport tab bar: vertical mouse wheel scrolls tabs horizontally. Implemented with native `addEventListener('wheel', ..., { passive: false })` in useEffect (not React onWheel) to avoid passive listener preventDefault warning. No third-party package; decision in docs/agent-artifacts/core/decisions.md.

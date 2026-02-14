# IDE Navigation Decisions

Decisions from the analysis loop. Aligns with [repo_studio_analysis/DECISIONS-WORKSPACE-PANELS](../repo_studio_analysis/DECISIONS-WORKSPACE-PANELS.md) (Navigator).

## IN-01: Navigator

**Decision**: Use **Navigator**—generic panel for any workspace; shows in Code workspace first. (Already decided in DECISIONS-WORKSPACE-PANELS, DS-08.)

**Rationale**: One shared navigation surface; avoid duplicating tree/list per workspace.

## IN-02: Search API

**Decision**: **Server-side** search. API: `/api/repo/search?q=&include=&exclude=&regex=`

**Rationale**: Expect big monorepos; server-side scales; client-side doesn't.

## IN-03: Web vs Electron Priority

**Decision**: **Electron-first** for file watchers and live updates.

**Rationale**: Native file watchers; better perf for changed/new files, git status. Web gets polling fallback.

## IN-04: Default Exclude

**Decision**: **No default exclude.** Show all files by default. User opts to exclude when they want.

**Rationale**: When viewing all files, don't hide anything by default. Exclude is user preference.

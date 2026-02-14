# Repo Studio: Workspace, Panel, and Layout Decisions

Captured from planning session. Informs implementation across repo_studio_analysis, ide_navigation_analysis, agent_centric_ide_analysis.

## Menus

| Decision | Value |
|----------|-------|
| Menu parity with main Studio | Yes. Per-editor (workspace) contribution model. |
| Workspaces define own menus | Yes. Planning, Env, Commands, Story, Code, etc. each contribute. |
| Menu bar on workspace switch | Changes (like Dialogue vs Character). |
| Shortcuts | Workspaces register their own shortcuts. |

## Settings

| Decision | Value |
|----------|-------|
| Full settings registry pattern | Yes. AppSettingsProvider, ViewportSettingsProvider, GraphViewportSettings pattern. |
| Migrate RepoSettingsPanelContent | Yes. Codegen for defaults. |
| Per-workspace settings | Yes. Each workspace contributes sections; settings register and become centralized. |
| Example: Env profile/mode, Code scope, Planning loop id | Each as workspace-contributed section. |

## Panel Registration

| Decision | Value |
|----------|-------|
| Mount → register on mount → unregister on unmount | Yes. Same pattern as main Studio. |
| Workspace contributes panels | Yes. Panels appear when that workspace is active. |

## Layout and Flexibility

| Decision | Value |
|----------|-------|
| Move panels between rails | Yes. Already supported via EditorDockLayout; snappable, multitab, resize, redock. |
| Story workspace | Own workspace with Codex, diff, etc. (same setup as Planning). |
| Planning workspace | Uses Codex, assistants, file diff, review. Doc list left, content main. |
| Docs | Own workspace. |
| Terminal | Modular; can go in any workspace. |
| Panel modularity | Many panels usable across workspaces. If components insufficient → loop analysis. |
| Default layout | Declarative code = source of truth. Codegen for reset. |
| Reset layout | Yes. Resets to default from code. |

## Panel Persistence

| Decision | Value |
|----------|-------|
| Storage | localStorage preferred; Payload if easier. |
| React Query | Hope to use (or similar) to avoid performance issues. |
| Note | Repo Studio does not currently use React Query. |

## Workspaces as Siblings

| Decision | Value |
|----------|-------|
| Multiple workspaces open | Yes. Like Dialogue and Character editors as siblings. |
| Env | Own workspace/editor with own panels. Sibling to (Story/Writer), Loop, Code. |
| Loop Assistant | Lives in a panel; gets context from workspace/editor it's in; can be in any workspace. |
| Loops | Can exist for story, code, planning. Need PRDs and planning iteration. |

## Shared Panels and Ownership

| Decision | Value |
|----------|-------|
| Shared panel library | Generic. Studio doesn't need diff, but panels should be generic. |
| Navigator (file tree) | Generic panel for any workspace. Shows in Code workspace for now. |
| Behavior props | Modular. Attach/copy/refresh only show if data available. Optionally hide with prop. |
| No data = no buttons | Don't show attach/copy/refresh if panel can't provide data. |

## Loop Assistant Context

| Decision | Value |
|----------|-------|
| Attachable content | Yes. Every workspace should expose where applicable. |
| "Add panel context" | Like Cursor mentions/referencing files. Click panel → paste/reference in chat. |
| Assistant awareness | Aware of active workspace. Preload context for that workspace. |
| Full context spec | TBD. Need to flesh out (planning docs, file content, env, command output, git, diff). |

## Diff and Review Queue

| Decision | Value |
|----------|-------|
| Review Queue UX | Click file → pops up in Monaco; diff shown directly in single file, one file at a time. |
| Planning docs, loops | Same pattern (click → Monaco with diff). |
| Proposal storage | SQLite. |
| Proposal → file mapping | Yes (jump from modified X.ts to diff); user unsure on proposals. |
| Sub-agents | One queue with metadata. Sub-agents work independently. Ralph Wiggum loops while sleeping. |

## Open Questions

- Loop Assistant context: what exactly to receive, scope (global vs active workspace).
- Proposal flow: full UX for proposals + file mapping.
- Component gaps: what EditorDockLayout/EditorShell need for full modularity.

## Cross-Reference

- [DECISIONS.md](DECISIONS.md) — DS-01 through DS-06
- [WORKSPACE-AUDIT.md](WORKSPACE-AUDIT.md) — Feature matrix
- [GAPS.md](GAPS.md) — Add: React Query; UI load errors; component modularity

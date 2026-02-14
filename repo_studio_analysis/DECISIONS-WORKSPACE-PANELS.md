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
| Story workspace | Own workspace with Codex, diff, etc. Same layout as Planning; different context (story vs planning). |
| Planning workspace | Uses Codex, assistants, file diff, review. Doc list left, content main. |
| Story vs Planning | Same layout. Different contexts only (story files vs .planning/code). |
| Docs | Own workspace. Main content = doc being viewed. Markdown rendered fully. Aspirational: MDX, docs as part of app. |
| Terminal | Modular; can go in any workspace. |
| Panel modularity | Many panels usable across workspaces. If components insufficient → loop analysis. |
| **Default layout** | **Declarative code in the codebase IS the default.** No config override for "default." Codegen from code. Reset layout = restore what's in code. Do not ask again. |
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
| Navigator (file tree) | Generic panel for any workspace. Code workspace first. See [ide_navigation_analysis/](../ide_navigation_analysis/) DECISIONS IN-01. |
| Behavior props | Modular. Attach/copy/refresh only show if data available. Optionally hide with prop. |
| No data = no buttons | Don't show attach/copy/refresh if panel can't provide data. |

## Loop Assistant Context

| Decision | Value |
|----------|-------|
| Default context | Active loop id + files for that loop. Assistant can talk about the loop; use loop id to fetch files. |
| Injection | Both: system context + optional @ references. |
| Cache invalidation | File change; manual refresh. Reuse cache when returning to same loop and nothing changed. |
| Attachable content | Yes. Every workspace should expose where applicable. |
| **@ mentions UX** | Paste data; display in chat as tag (like Cursor's @file). Remove @ → removes from chat. Reference symbol that points to data. |
| Assistant awareness | Aware of active workspace. Preload context for that workspace. |

## Diff and Review Queue

| Decision | Value |
|----------|-------|
| Review Queue layout | File list on left; Monaco diff on right. Click file → load its diff. |
| Diff display | Parse unified diff to extract per-file. Prefer unified view with line highlighting; not side-by-side original/modified. |
| Planning docs, loops | Same pattern (click → diff). |
| Proposal storage | SQLite. |
| Proposal → file mapping | Yes. Parse unified diff; extract per-file for display. |
| Proposal attribution | Send agentId and agentType with requestApproval. |
| Queue views | Both: separate queues per agent + aggregate view. Two views. |
| Sub-agents | One shared queue with metadata. Sub-agents work independently. Ralph Wiggum loops while sleeping. |

## Trust Scope (Approval Override)

| Decision | Value |
|----------|-------|
| Trust scope | **Global setting only.** Auto-approve all vs require approval. No per-loop, per-domain, per-agent. |
| Rationale | Reviewing hundreds manually is too hard; granular trust adds complexity without benefit. |
| Enables | Ralph Wiggum loops; overnight runs when global trust on. |

## Agent Observability

| Decision | Value |
|----------|-------|
| Placement | Dedicated Observability workspace (own workspace; not Codex Assistant panel) |
| Metrics | Tool invocations, searches, paths, latency, tokens, cost (estimate OK) |
| Updates | Real-time; live during turn |
| See | [agent_observability_analysis/](../agent_observability_analysis/) — DECISIONS.md AO-01–AO-04 |

## Planning → Execution Loop (GSD + Repomirror)

| Phase | Model | Source |
|-------|-------|--------|
| **Planning** | GSD-style. Orchestrator spawns specialized agents (research, planner, verifier). Discuss → plan → verify. | [get-shit-done](https://github.com/gsd-build/get-shit-done) |
| **Execution** | Repomirror-style. Many parallel Ralph loops (one agent per loop, runs until done). Like engineering teams. | [repomirror](https://github.com/MagicbornStudios/repomirror) |
| **Flow** | Planning loop → Execution (many agents) → Planning loop → Execution → … |

Repomirror: single agent in `while :; do cat prompt \| claude -p --dangerously-skip-permissions; done`. No subagents. "Many agents" = Repo Studio spawns many parallel loops, each with slice of plan. Execution loops run until done, then back to planning.

## Orchestrator Model

| Option | Pros | Cons |
|--------|------|------|
| **Repo Studio process** | Single codebase; full control; integrates with Review Queue, trust, observability | Repo Studio must manage process lifecycle, restarts |
| Special Codex mode | Codex-native | Unknown if Codex supports; locks to Codex |
| External (e.g. GSD CLI) | Reuse existing | Split control; harder to integrate queue, UI |

**Decision**: Repo Studio process. User fine with it. Integrates proposals, queue, trust, observability.

## Open Questions

- Component gaps: what EditorDockLayout/EditorShell need for full modularity.

## Cross-Reference

- [DECISIONS.md](DECISIONS.md) — DS-01 through DS-14
- [WORKSPACE-AUDIT.md](WORKSPACE-AUDIT.md) — Feature matrix
- [GAPS.md](GAPS.md) — Add: React Query; UI load errors; component modularity

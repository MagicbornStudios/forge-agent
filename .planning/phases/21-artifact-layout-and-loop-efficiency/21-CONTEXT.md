# Phase 21: Artifact layout and loop efficiency — planning

## Purpose

A **planning/design-only** phase. Decide and document (1) how `.planning` (and related) artifacts are **laid out for users** in Repo Studio (which panels, grouping, what appears where), and (2) how **loops remain efficient** (context, tools, cadence, human/agent handoffs). Output is decisions and guidance that inform Phase 20 panel design and Phase 22 workspace/panel refactor. No code deliverables.

## Current gaps

- No single spec for "which artifacts go in which panels" or how to group them (e.g. Overview vs Work); Phase 20 adds DoD and HUMAN-TASKS but panel count and grouping are ad hoc.
- Loop efficiency (context, tools, handoffs) is spread across Phase 19, HUMAN-TASKS, and DoD; no consolidated checklist or decisions for "how we keep loops efficient" when using Repo Studio.
- **User workflow and expectations** are not fully documented: how we expect users to use planning docs and parsed info, how **blocking** is visible (human todos, agent tasks blocked by HT-xx), **notifications** (human-blocked, execution done, other loops running), what **appears in chat** (context, suggested next), and how layout supports that workflow. Phase 20 CONTEXT and 20-03 start this; Phase 21 should capture it as design so layout and panels align.
- **Autonomous / overnight mode:** See DECISIONS (Autonomous execution and overnight mode). Agents update docs as they go; Codex can work with planning agent in background during implementation; no automatic Planning→Code handoff (human decides); multiple loops in parallel; session state for resume. Agents default to recommended action.
- **Context budget:** See DECISIONS (Context budget and compaction). 128k per request; chat and tool results summarized beyond recent ~15 turns; fixed planning list (STATE, active phase, HUMAN-TASKS) + on-demand codebase/URL retrieval.
- **Codebase indexing:** See DECISIONS (Codebase indexing and exclusion policy, Vector stack). sqlite-vss; Transformers.js + all-MiniLM-L6-v2; model at install time; exclude .gitignore + vendor/ + .cursorignore.
- **Badge and hover behavior:** Badges on task list items, phase list items, and tree (wave, depends, "blocked by"). On **hover**: popup (not just tooltip) with more info (summary, doc reference, section). On **click**: open doc in viewport and navigate to referenced section. Status strip (toolbar), toast settings, scan/parse interval — see Phase 20-03.

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, TASK-REGISTRY, HUMAN-TASKS.md, DEFINITION-OF-DONE.md, and this phase folder.
- [docs/agent-artifacts/core/styling-and-ui-consistency.md](../../../docs/agent-artifacts/core/styling-and-ui-consistency.md) — Workspace and panel composition rules (viewport-centric, tree when file-like, panel discipline).

## Key documents

- **21-01-PLAN.md** — Artifact layout for users: which artifacts, which panels/groups, viewport vs tree; consistency with workspace and panel composition rules.
- **21-02-PLAN.md** — Loop efficiency: context (loopId, workspaceId, selectedDocId), tools (add task, update status, open doc), cadence and human/agent handoffs; reference Phase 19 and HUMAN-TASKS/DoD.

## Dependencies

- **Phase 19** (Planning assistant context and tools) and **Phase 20** (Planning artifacts first-class) inform this. Phase 21 can run after or in parallel with 20 so layout decisions can inform 20's panel choices and 22's refactor.

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/HUMAN-TASKS.md](../../HUMAN-TASKS.md), [.planning/DEFINITION-OF-DONE.md](../../DEFINITION-OF-DONE.md).
- [.planning/phases/19-planning-assistant-context-and-tools/](../19-planning-assistant-context-and-tools/), [.planning/phases/20-planning-artifacts-and-todos-in-repo-studio/](../20-planning-artifacts-and-todos-in-repo-studio/).

# Phase 21: Artifact layout and loop efficiency — planning

## Purpose

A **planning/design-only** phase. Decide and document (1) how `.planning` (and related) artifacts are **laid out for users** in Repo Studio (which panels, grouping, what appears where), and (2) how **loops remain efficient** (context, tools, cadence, human/agent handoffs). Output is decisions and guidance that inform Phase 20 panel design and Phase 22 workspace/panel refactor. No code deliverables.

## Current gaps

- No single spec for "which artifacts go in which panels" or how to group them (e.g. Overview vs Work); Phase 20 adds DoD and HUMAN-TASKS but panel count and grouping are ad hoc.
- Loop efficiency (context, tools, handoffs) is spread across Phase 19, HUMAN-TASKS, and DoD; no consolidated checklist or decisions for "how we keep loops efficient" when using Repo Studio.

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

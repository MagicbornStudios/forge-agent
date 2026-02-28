# Phase 19: Planning assistant context and tools

## Purpose

Ensure the assistant receives correct **context** (loopId, workspaceId, selectedDocId) on every request so "current loop / workspace / doc" in the UI matches what the server and tools use. Add **plan-specific Forge tools** (add task, update status, open planning doc) scoped to the active loop's planning root. Optionally add **LangGraph** for planning orchestration (multi-step workflows, multi-loop awareness, checkpoints) behind a feature flag while keeping the existing stream UX.

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, DECISIONS, TASK-REGISTRY, and this phase folder.
- Loop-scoped planning root: default → `.planning`; other loops → `.planning/loops/<loopId>` (see [apps/repo-studio/src/lib/repo-data.ts](../../../apps/repo-studio/src/lib/repo-data.ts)).

## Key documents

- **19-01-PLAN.md** — Client→server context: ensure loopId, workspaceId, selectedDocId in request body or server fallback to query params.
- **19-02-PLAN.md** — Plan-specific Forge tools: add_task, update_task_status, open_planning_doc (scoped to active loop).
- **19-03-PLAN.md** — LangGraph for planning assistant (feature-flagged): orchestration, multi-loop awareness, optional checkpoints.

## Dependencies

- **Phase 15** (release cut). Can overlap with Phase 16–18.
- Assistant chat route: [apps/repo-studio/app/api/assistant-chat/route.ts](../../../apps/repo-studio/app/api/assistant-chat/route.ts). Forge contract and tools: [apps/repo-studio/src/lib/assistant/forge-contract.ts](../../../apps/repo-studio/src/lib/assistant/forge-contract.ts).

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/DECISIONS.md](../../DECISIONS.md).
- Mention context: [apps/repo-studio/src/lib/assistant/mention-context.ts](../../../apps/repo-studio/src/lib/assistant/mention-context.ts). Planning snapshot: [apps/repo-studio/src/lib/repo-data.ts](../../../apps/repo-studio/src/lib/repo-data.ts).

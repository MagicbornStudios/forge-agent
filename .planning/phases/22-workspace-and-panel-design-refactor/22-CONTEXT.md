# Phase 22: Workspace and panel design refactor — composition, chat-in-chat, fewer rails

## Purpose

Execute the UX constraints documented in [docs/agent-artifacts/core/styling-and-ui-consistency.md](../../../docs/agent-artifacts/core/styling-and-ui-consistency.md) § **Workspace and panel composition**: remove or replace Copy @ (and similar) from panels so attach/reference lives in the assistant chat (chat-in-chat); reduce Planning left rail via grouping/tabs/collapse; use tree as primary with context menu for structure actions where applicable (e.g. Story, Planning). Align with Phase 21 artifact layout decisions when available.

## Current pain

- **Copy @** (and "Open in Assistant") buttons appear in multiple panels (PlanningPanel, PlanningDocumentsPanel); the intended UX is @-mentions in the assistant composer, not per-panel buttons.
- **Planning left rail** has seven panels (PRD, Status, Decisions, Regression, Phases, Tasks, Documents); hard to navigate; violates "panel discipline" (fewer, purpose-driven rails).
- **Story workspace** uses a table (Act/Chapter/Page) with per-row "Open" instead of a tree with context menu for navigation and structure actions.

## Source of truth

- **Workspace and panel composition** — [docs/agent-artifacts/core/styling-and-ui-consistency.md](../../../docs/agent-artifacts/core/styling-and-ui-consistency.md).
- **Phase 21** — [.planning/phases/21-artifact-layout-and-loop-efficiency/](../21-artifact-layout-and-loop-efficiency/) (artifact layout and loop efficiency decisions) when done.

## Key documents

- **22-01-PLAN.md** — Chat-in-chat: remove Copy @ (and similar) from panels; rely on @ in assistant composer; document in DECISIONS.
- **22-02-PLAN.md** — Panel discipline: reduce Planning left rail (group/tab/collapse); align with Phase 21 artifact layout if done.
- **22-03-PLAN.md** — Tree as primary: context menu (and optional toolbar) for structure actions; Story or Planning tree improvements as needed.

## Dependencies

- **Phase 21** (Artifact layout and loop efficiency) recommended first so refactor follows agreed layout. Phase 20 can overlap (e.g. add DoD/HUMAN-TASKS panels in 20, then group them in 22).

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/DECISIONS.md](../../DECISIONS.md).
- [apps/repo-studio/src/components/features/planning/PlanningPanel.tsx](../../../apps/repo-studio/src/components/features/planning/PlanningPanel.tsx), [PlanningDocumentsPanel.tsx](../../../apps/repo-studio/src/components/features/planning/PlanningDocumentsPanel.tsx) — current Copy @ usage.

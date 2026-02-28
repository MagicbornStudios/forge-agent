# Phase 20: Planning artifacts first-class in Repo Studio — DoD, HUMAN-TASKS, panels, unified todos

## Purpose

Bake **planning artifacts** (DEFINITION-OF-DONE, HUMAN-TASKS) into Repo Studio so they are loaded, visible, and usable in the Planning workspace. Provide a **unified view** of "my todos" (human) vs "agent tasks" (TASK-REGISTRY) with correlation (e.g. task blocked by HT-xx). Optionally trigger a **planning-focused assistant conversation** when the user opens the Planning workspace (Codex discusses "what to do"). Align with user expectations: artifacts are first-class in the UI, human-blocked items are visible, and AI can use DoD/HUMAN-TASKS for context.

## Current state

- **Wired:** Planning workspace gets `planningSnapshot` from server (`loadRepoStudioSnapshot` / repo-data). Core docs are collected in [apps/repo-studio/src/lib/repo-data.ts](../../../apps/repo-studio/src/lib/repo-data.ts) via `collectPlanningDocs` with a fixed **coreFiles** list: PRD.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, DECISIONS.md, ERRORS.md, TASK-REGISTRY.md. Phase-folder markdown is also loaded. PRD has a dedicated panel (PrdPanel); Status, Decisions, Regression, Phases, Tasks, Documents panels exist. Assistant panel is global with Forge/Codex switch.
- **Not wired:** **DEFINITION-OF-DONE.md** and **HUMAN-TASKS.md** are **not** in coreFiles, so they are not in the planning snapshot or any panel. No "Human TODOs" panel, no DoD panel, no unified "my todos | agent tasks" view with correlation, no on-load Codex "what to do" discussion, no tagging/notifications for human-blocked items.

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, TASK-REGISTRY, HUMAN-TASKS.md, DEFINITION-OF-DONE.md, and this phase folder.
- Planning snapshot and panels: [apps/repo-studio/src/lib/repo-data.ts](../../../apps/repo-studio/src/lib/repo-data.ts), [PlanningWorkspace](../../../apps/repo-studio/src/components/workspaces/PlanningWorkspace.tsx).

## Key documents

- **20-01-PLAN.md** — Add DoD and HUMAN-TASKS to planning snapshot (coreFiles); add DoD panel and Human TODOs panel (or combined) in Planning workspace.
- **20-02-PLAN.md** — Unified "My todos | Agent tasks" view: show HUMAN-TASKS items and TASK-REGISTRY tasks with correlation (e.g. "blocked by HT-04"); optional badges.
- **20-03-PLAN.md** — On Planning workspace load: optional open assistant and send planning "what to do" prompt to Codex; optional tagging/notifications for human-blocked items; document behavior and deferrals in DECISIONS.

## Dependencies

- **Phase 19** (Planning assistant context and tools) recommended first so context and plan tools are correct; can overlap with Phase 16–18.
- HUMAN-TASKS.md and DEFINITION-OF-DONE.md already exist in `.planning/`; this phase wires them into Repo Studio.

## References

- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/HUMAN-TASKS.md](../../HUMAN-TASKS.md), [.planning/DEFINITION-OF-DONE.md](../../DEFINITION-OF-DONE.md).
- [docs/18-agent-artifacts-index.mdx](../../../docs/18-agent-artifacts-index.mdx) — lists HUMAN-TASKS and DoD as source of truth.

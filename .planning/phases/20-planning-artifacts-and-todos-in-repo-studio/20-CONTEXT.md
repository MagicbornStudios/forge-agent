# Phase 20: Planning artifacts first-class in Repo Studio — DoD, HUMAN-TASKS, panels, unified todos

## Purpose

Bake **planning artifacts** (DEFINITION-OF-DONE, HUMAN-TASKS) into Repo Studio so they are loaded, visible, and usable in the Planning workspace. Provide a **unified view** of "my todos" (human) vs "agent tasks" (TASK-REGISTRY) with correlation (e.g. task blocked by HT-xx). Optionally trigger a **planning-focused assistant conversation** when the user opens the Planning workspace (Codex discusses "what to do"). Align with user expectations: artifacts are first-class in the UI, human-blocked items are visible, and AI can use DoD/HUMAN-TASKS for context.

## Current state

- **Wired:** Planning workspace gets `planningSnapshot` from server (`loadRepoStudioSnapshot` / repo-data). Core docs are collected in [apps/repo-studio/src/lib/repo-data.ts](../../../apps/repo-studio/src/lib/repo-data.ts) via `collectPlanningDocs` with a fixed **coreFiles** list: PRD.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, DECISIONS.md, ERRORS.md, TASK-REGISTRY.md. Phase-folder markdown is also loaded. PRD has a dedicated panel (PrdPanel); Status, Decisions, Regression, Phases, Tasks, Documents panels exist. Assistant panel is global with Forge/Codex switch.
- **Not wired:** **DEFINITION-OF-DONE.md** and **HUMAN-TASKS.md** are **not** in coreFiles, so they are not in the planning snapshot or any panel. No "Human TODOs" panel, no DoD panel, no unified "my todos | agent tasks" view with correlation, no on-load Codex "what to do" discussion, no tagging/notifications for human-blocked items. **Parsed plan metadata** (wave, dependsOn, phase) is shown only in the Plan Metadata detail when a PLAN doc is selected; not in tree/list. No visibility of "blocked by" or "other loops executing / done" or chat workflow for planning.

## Parsed data to surface and UX expectations

- **More parsed fields to surface:** Today we parse PLAN frontmatter (phase, plan, wave, dependsOn, filesModified, mustHaves). Expose these in the UI beyond the single "Plan Metadata" block: **badges** on **task list items**, **phase list items**, and **tree** (e.g. wave, depends, "blocked by"). Optionally: phase-level "Depends on" from ROADMAP; task status from TASK-REGISTRY when correlated.
- **Blocking:** "Blocked by" badges on tree and task list (e.g. "blocked by HT-04"). On **hover**: show a **popup** (not just tooltip) with more info (summary, doc reference, section). On **click**: open the referenced doc in the viewport and navigate to the referenced section.
- **Status strip (toolbar):** A **status strip** in the toolbar showing a **rotating cycle** of "currently running" items (e.g. "Phase 19-02 executing", "Codex on loop X") — breaking-news style, one or a short list at a time. **Task completion** notifications also surface here or as toasts (see below).
- **Toasts and task completion:** Task completion and other execution events can trigger toasts. **Settings:** User-configurable **toast types** (e.g. task done, phase done, human-blocked, errors only) so users are not overwhelmed when many agents are executing. Settings UI and codegen are existing pattern; add planning/notification preferences.
- **Real-time parsing:** To keep planning data up to date we must **re-scan/parse** planning docs periodically. **Do not** poll too fast. **Default:** ~30 seconds. **Configurable:** Scan/parse interval in **settings** (UI-first; use existing settings registry and codegen). Document default and min/max in DECISIONS.
- **Context budget:** 128k per request; chat and tool results summarized beyond recent ~15 turns; fixed planning list + on-demand codebase/URL retrieval (DECISIONS: Context budget and compaction). **Indexing exclusions:** .gitignore + vendor/ (default) + .cursorignore; opt-in vendor (DECISIONS: Codebase indexing and exclusion policy).
- **Planning welcome:** **Default OFF.** Do not auto-send a "what to do" message on load. Instead show **suggested prompts** to get started (e.g. "What should we work on next?", "Review current state"). User can click to send. Configurable if we later add "welcome on" for power users.
- **Chat and workflow:** Chat receives loopId, workspaceId, and a **doc reference** (for initial context or when user says "this" / current file) — selectedDocId as reference, not mandatory. **Suggested prompts** are **chips** (clickable); user **must select** one — not in input, not in chat, not automatic. Prompts disappear after selection. **Codex display:** show **tools being used**, **tasks being worked**, **different text coloring** for tool calls, **summary**; sometimes asks questions. Special formatting for agent workflow. **Output presentation:** focus on **linkification** — links to executables, files in repo, web URLs; rich text and formatting (see DECISIONS: Agent output UX and linkification). **Multi-loop:** while agent works in one loop, user can **inspect other loops and work at the same time**. **Session scope:** each workspace can work on its **own loop** (Planning = planning loop; Concept simulation = concept loop; Code = implementation loop). **System prompts per workspace** so each knows how to behave and scope; can get context from its files and related loops. Planning docs from a loop (Planning workspace) feed into Code workspace for agents to execute. **Code workspace** = custom UI for Codex; agents can bypass via codex/claude code CLIs. **Skills:** show skills **installed** to project and **available** from get-shit-done (or our custom version); if custom, version it in our forked repo.

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

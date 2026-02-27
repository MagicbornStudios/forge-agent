# Phase 15: Strategic shift — Repo Studio + Platform focus

## Purpose

This phase captures a **strategic product and architecture shift**. We are archiving the legacy Studio app (character workspace, dialogue workspace), deprecating forge graphs and Yarn Spinner dialogue support on the platform, turning consumer-studio and dialogue into extensions (in another repo or submodule), and focusing all main-app and platform effort on **Repo Studio** and the **platform** that backs it. All of this is documented as future plans and will be executed through the loop (discuss → plan → execute → verify), with full use of PRD, phases, tasks, decisions, and Ralph Wiggum–style done criteria.

## Source of truth

- **`.planning/`** — PRIMARY. STATE, ROADMAP, DECISIONS, TASK-REGISTRY, REQUIREMENTS, and this phase folder.
- **Legacy snapshots** in `docs/agent-artifacts/core/` are continuity only; after loop work, run `forge-loop sync-legacy` to update them.

## Key documents in this phase

- **15-PRD.md** — Product intent and scope for the shift (what we are moving to, what we are deprecating).
- **15-01-PLAN.md** — Master plan: archive/deprecation scope, extension moves, platform changes, and execution order. This is the main artifact for “document the shit out of it” and for loops of discussion.
- **15-RESEARCH.md** — (Optional) Research notes and references (e.g. extension repo layout, platform API surface).
- **DECISIONS.md** — All strategic decisions (archive Studio app, deprecate graphs, platform supports Repo Studio, etc.) are logged here with dates.
- **TASK-REGISTRY.md** — Phase 15 tasks (planning, discussion, and later implementation) are registered here.

## Current understanding (pre–discussion loop)

1. **Studio app (apps/studio)** — To be **archived**. Contains Character workspace and Dialogue workspace. Character workspace will move to an **extensions submodule** (in another repo). Dialogue workspace will also move to that other repo / extensions; both are to be **out of main apps**.
2. **Platform** — Remains the backend for Repo Studio (auth, API keys, desktop connection, etc.). Platform data “still works well” except **forge graphs**, which are **deprecated** and will not be worked on for a long time. **Yarn Spinner dialogue support** is **deprecated**. Platform must **support Repo Studio more**; no need for graph or dialogue support in platform going forward.
3. **Consumer-studio (apps/consumer-studio)** — Not a main app. To be turned into **another extension** (e.g. bare-bones reference that people can build on), same pattern as other extensions.
4. **Dialogue workspace** — To live in the **other repo** (extensions), not in main apps.
5. **Focus** — We are working on **Repo Studio** and the **platform** behind it. Everything else (Studio app, consumer-studio as app, dialogue/character as in-repo apps) is archived or moved to extensions.
6. **Process** — We use the **loop** (forge-loop), add **phases**, **tasks**, **decisions**; we document thoroughly; we go through **loops of discussion** (discuss → plan → execute → verify). Ralph Wiggum done criteria and PRD apply.

## Dependencies

- Phase 14 (AI/chat-first hard-cut and consumer studio reference) is complete or in closeout.
- This phase is **planning- and discussion-heavy** first; implementation slices will be broken out into subsequent plans (15-02, 15-03, …) after discussion stabilizes.

## References

- Root [AGENTS.md](../../AGENTS.md), [docs/18-agent-artifacts-index.mdx](../../../docs/18-agent-artifacts-index.mdx), [docs/19-coding-agent-strategy.mdx](../../../docs/19-coding-agent-strategy.mdx).
- [.planning/STATE.md](../../STATE.md), [.planning/ROADMAP.md](../../ROADMAP.md), [.planning/DECISIONS.md](../../DECISIONS.md), [.planning/TASK-REGISTRY.md](../../TASK-REGISTRY.md).
- Extension pattern: [.repo-studio/extensions](../../../.repo-studio/extensions), [vendor/repo-studio-extensions](../../../vendor/repo-studio-extensions) (if present), and Repo Studio workspace catalog.

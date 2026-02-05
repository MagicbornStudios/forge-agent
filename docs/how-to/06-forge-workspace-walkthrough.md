# 06 – ForgeWorkspace walkthrough

How ForgeWorkspace is built: shell composition, domain contract, plan API, execute, **WorkspaceReviewBar**, and commit. Code references only (no full listings).

## File and packages

- **Workspace UI**: `apps/studio/components/workspaces/ForgeWorkspace.tsx` — composes `WorkspaceShell`, Header, Toolbar, **WorkspaceReviewBar**, LayoutGrid (main = GraphEditor, right = Inspector, bottom = ForgeTimeline), StatusBar, OverlaySurface.
- **Domain contract**: `packages/domain-forge/src/copilot/index.ts` — `useForgeContract(deps)` returns `DomainCopilotContract`; `packages/domain-forge/src/copilot/actions.ts` — `createForgeActions` (forge_createNode, forge_updateNode, forge_createPlan, forge_executePlan, forge_commit, etc.).
- **Plan API**: `apps/studio/app/api/forge/plan/route.ts` — `POST` with `goal` and `graphSummary`; returns `{ steps }` via OpenRouter structured output.
- **Review bar**: Shared component `packages/shared/src/shared/components/workspace/review/WorkspaceReviewBar.tsx`. ForgeWorkspace passes `visible={isDirty && pendingFromPlan && !!graph}`, `onRevert={() => graph && loadGraph(graph.id)}`, `onAccept={() => setPendingFromPlan(false)}`. State (`isDirty`, `pendingFromPlan`, `graph`, `loadGraph`, `setPendingFromPlan`) lives in `apps/studio/lib/store.ts` (graph store).

## Data flow

- **Draft**: Graph store (`useGraphStore`) holds `graph`, `isDirty`, `pendingFromPlan`; `applyOperations` updates draft; `loadGraph` refetches and resets; `setPendingFromPlan` clears the “pending from plan” flag.
- **Save**: `useSaveGraph()` mutation (from `apps/studio/lib/data/hooks`) writes draft to `PATCH /api/graphs/:id` and invalidates queries; ForgeWorkspace also wires `commitGraph` for `forge_commit` action.
- **Plan**: `forge_createPlan(goal)` → `createPlanApi(goal, graphSummary)` → `POST /api/forge/plan` → returns steps. `forge_executePlan(steps)` runs each step via `applyOperations`, highlights, then `setPendingFromPlan(true)`. User sees **WorkspaceReviewBar**; Revert refetches graph, Accept clears pending; Save (or `forge_commit`) persists.

## Modular pieces

| Piece | Location | Role |
|-------|----------|------|
| Shell, slots, WorkspaceReviewBar | `packages/shared/.../workspace/` | Declarative layout and review bar UI |
| Forge contract and actions | `packages/domain-forge/src/copilot/` | Context, actions, suggestions, plan/execute/commit |
| Graph store and persistence | `apps/studio/lib/store.ts`, `lib/persistence/` | Draft and lastGraphId |
| Plan API | `apps/studio/app/api/forge/plan/` | LLM-generated plan steps |
| Hooks and API client | `apps/studio/lib/data/` | TanStack Query and fetch |

## What the AI can do

Full plan–execute–review–commit: create plan, execute steps, user reviews with Revert/Accept via **WorkspaceReviewBar**, then commit (save). Plus all other Forge actions (create/update/delete nodes and edges, getGraph, revealSelection, open create modal).

**Next:** [07 – Copilot and AI integration](07-copilot.md)

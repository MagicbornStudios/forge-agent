# 05 - Building a workspace from scratch

Step-by-step: add a workspace, shell + slots, main content, inspector, toolbar actions, then wire the domain contract. At each step we note what the AI can do.

## Step 1: Add workspace id and route

- In `apps/studio/lib/app-shell/store.ts`, add your workspace id to `AppShellWorkspaceId` (e.g. `'myworkspace'`).
- In `apps/studio/lib/app-shell/workspace-metadata.ts`, add label and editor summary.
- In `AppShell.tsx`, add a tab and render branch: `{activeWorkspaceId === 'myworkspace' && <MyWorkspace />}`.

**AI at this stage:** Shell can switch to your workspace via `switchWorkspace`; no domain context yet.

## Step 2: Shell + slots

Create `MyWorkspace.tsx`. Compose `WorkspaceShell`, `WorkspaceHeader`, `WorkspaceToolbar`, `WorkspaceLayoutGrid` (with a placeholder `main`), `WorkspaceStatusBar`, `WorkspaceOverlaySurface`. No data binding yet.

**AI at this stage:** Same as step 1; workspace is just layout.

## Step 3: Main slot content

Put your editor or main UI in `WorkspaceLayoutGrid`'s `main` prop. If you need selection state, hold it in local state or a small store; expose it later for the inspector and the Copilot contract.

**AI at this stage:** No domain contract yet; AI cannot read or change workspace state.

## Step 4: Inspector (optional)

Use `WorkspaceLayoutGrid`'s `right` slot with `WorkspaceInspector`. Pass `selection` and `sections` (or children). Selection shape is shared: see `packages/shared/src/shared/workspace/selection.ts`.

**AI at this stage:** Still no contract; AI does not see selection or domain state.

## Step 5: Toolbar actions and domain contract

- Implement a domain contract: `getContextSnapshot()`, `getInstructions()`, `createActions()`, `getSuggestions()`, `onAIHighlight`, `clearAIHighlights`. See `packages/shared/src/shared/copilot/types.ts` (`DomainCopilotContract`).
- In your workspace, call `useMyContract(deps)` then `useDomainCopilot(myContract, { toolsEnabled })`. Register toolbar actions (e.g. Save) that call your store or mutations.

**AI at this stage:** AI can read context (selection, domain state) and run actions (create/update/delete, save). No plan-execute-review yet unless you add it.

## Step 6: Plan-commit (optional)

If your workspace supports plan-execute-review-commit: add a plan API (e.g. `POST /api/my/plan`), actions like `my_createPlan` and `my_executePlan`, and `WorkspaceReviewBar` between Toolbar and LayoutGrid. Render the plan in chat with `PlanCard` + `PlanActionBar` (see ForgePlanCard) so the user can Apply/Dismiss before executing. Wire `visible` to `(isDirty && pendingFromPlan)`, `onRevert` to refetch, `onAccept` to clear pending. State stays in your store.

**AI at this stage:** AI can create a plan, execute it, user reviews with Revert/Accept, then commit (save).

Reference implementation: ForgeWorkspace and `packages/domain-forge`; see [06 - ForgeWorkspace walkthrough](06-forge-workspace-walkthrough.mdx).

**Next:** [06 - ForgeWorkspace walkthrough](06-forge-workspace-walkthrough.mdx)

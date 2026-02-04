# Adding domain actions (workspace + CopilotKit)

This guide describes how to add a new workspace/domain (e.g. Writer, Characters) or new actions for an existing domain so the Copilot agent can operate that workspace.

## 1. Implement the capability contract

Every workspace that the agent operates should implement the shared **WorkspaceCapabilities** contract (see `packages/shared/src/shared/workspace/capabilities.ts`):

- **getSelection()** - Return the current shared `Selection` (e.g. `entity` for a node/edge, `textRange` for text, `none`).
- **getContextSnapshot()** - Return `WorkspaceContextSnapshot`: `workspaceId`, `selection`, `openDocumentId` / `openTemplateId`, and optional `context` (e.g. selected node label) for the LLM.
- **revealSelection()** (optional) - Fit the viewport to the current selection (e.g. fit view to node, scroll to range). Requires the editor to expose a viewport handle (e.g. React Flow `fitView` / `fitViewToNodes`).

You can implement these as callbacks or derived state in your workspace component; the agent does not call these directly - they back the **context** you expose via `useCopilotReadable` and the **revealSelection** action.

## 2. Expose context to the agent

In your workspace component, call **useCopilotReadable** with:

- A **description** of what this context is for (so the agent knows when to use it).
- A **value** object that includes at least:
  - `workspaceId` - e.g. "forge", "writer".
  - `editorType` - e.g. "reactflow", "lexical".
  - Domain-specific summary (e.g. `graphSummary`, `documentSummary`) and **selection** (or `selectionSummary`) so the agent can refer to "the selected node" or "the current paragraph".

Keep the value minimal but enough for the agent to reason about state and selection.

## 3. Define domain actions

Actions are the way the agent changes the workspace. Define them in a single place per domain (e.g. `apps/studio/lib/copilot-actions.ts` for Forge). Each action has:

- **name** - Stable ID (e.g. `createNode`, `insertText`).
- **description** - When and why the agent should use it.
- **parameters** - Name, type, description, required/optional.
- **handler** - Async function that performs the change (e.g. call store `applyOperations`, open overlay).

For a **new domain**, create a similar module (e.g. `apps/studio/lib/writer-copilot-actions.ts`) and optionally an **onAIChange** callback so the UI can highlight AI-created/edited elements.

## 4. Register actions when the workspace is active

Register actions only when that workspace is active. Forge does this by calling **useForgeCopilotActions** in the workspace component with:

- Graph/store access (`graph`, `applyOperations`).
- Overlay and viewport callbacks (`openOverlay`, `revealSelection`).
- Optional **onAIChange** for highlights.

For a new domain, create a hook (e.g. `useWriterCopilotActions`) that builds the action configs and calls **useCopilotAction** for each (hooks must be called unconditionally, so use a fixed number of `useCopilotAction` calls). Then call that hook from your domain's workspace component.

## 5. Checklist for a new domain

1. **Capabilities** - Implement `getSelection`, `getContextSnapshot`, and optionally `revealSelection` (with editor viewport handle).
2. **Context** - `useCopilotReadable` with `workspaceId`, `editorType`, selection, and domain summary.
3. **Actions** - Create entity, link/connect, edit, delete, get state, open overlay, reveal selection (as needed).
4. **Registration** - Domain hook that registers all actions via `useCopilotAction`; call it from the workspace component.
5. **Optional** - `onAIChange` and highlight state if you want to show what the AI changed.

## References

- **Forge actions** - `apps/studio/lib/copilot-actions.ts`, `apps/studio/lib/useForgeCopilotActions.ts`.
- **Capabilities** - `packages/shared/src/shared/workspace/capabilities.ts`.
- **AI integration overview** - [ai-workspace-integration.md](./ai-workspace-integration.md).
- **Architecture** - [architecture/workspace-editor-architecture.md](./architecture/workspace-editor-architecture.md).

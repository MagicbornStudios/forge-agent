# AI–workspace integration

## Overview

The chat UI operates the workspace: the Copilot agent reads context from the active workspace and performs edits via **actions**. This doc describes the flow and how to add or extend features per domain (Forge, Writer, etc.).

## Flow

1. **Context (what the agent sees)** — The workspace exposes a snapshot via `useCopilotReadable`: `workspaceId`, `editorType`, domain-specific summary (e.g. graph summary, selection, dirty state). The agent uses this to answer questions and decide which actions to call.

2. **Actions (what the agent can do)** — Registered with `useCopilotAction` (or a domain hook like `useForgeCopilotActions`). Examples: create node, update node, create edge, open overlay, reveal selection. The agent calls these in response to user requests.

3. **Optional: AI highlight** — When an action creates or edits an element, the workspace can report affected ids via an `onAIChange` callback so the UI highlights them for a few seconds (or until the next user interaction).

## Single place for wiring

In each workspace component (e.g. Forge `Workspace.tsx`), keep one clear block:

1. **Context** — `useCopilotReadable` with description and value (workspace id, editor type, selection, summary).
2. **Action registration** — All CopilotKit actions for that domain (e.g. `useForgeCopilotActions({ graph, applyOperations, openOverlay, revealSelection, onAIChange, createNodeOverlayId })`).
3. **Optional** — `onAIChange` and local state for AI highlight ids, passed into the action factory and into the editor (e.g. `GraphEditor` receives `aiHighlightIds` and applies a highlight class).

This keeps “AI → workspace” wiring in one place and makes it easy to add or document new actions per domain.

## Per-domain action checklist

When adding or documenting a new workspace/domain, consider implementing:

| Capability | Purpose | Forge example |
|------------|---------|----------------|
| **Create entity** | Add node, block, element | `createNode` |
| **Link / connect** | Connect two entities | `createEdge` |
| **Edit** | Update properties of selection | `updateNode` |
| **Delete** | Remove entity | `deleteNode` |
| **Get state** | Let agent read current data | `getGraph` |
| **Open overlay** | Open modal/drawer (e.g. create form) | `openCreateNodeModal` |
| **Reveal selection** | Fit viewport to selection | `revealSelection` |

Not every domain needs all of these; implement what makes sense and document the set for that domain.

## References

- **Context + actions** — `components/Workspace.tsx` (Forge), `lib/useForgeCopilotActions.ts`, `lib/copilot-actions.ts`.
- **Capabilities contract** — `src/shared/workspace/capabilities.ts` (`getSelection`, `getContextSnapshot`, `revealSelection`).
- **Adding a new domain** — See [adding-domain-actions.md](./adding-domain-actions.md).
- **Architecture** — [architecture/workspace-editor-architecture.md](./architecture/workspace-editor-architecture.md) (AI-first, unified API).

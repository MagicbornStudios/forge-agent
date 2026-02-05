# 07 – Copilot and AI integration

Context, actions, suggestions, highlights; plan–execute–review–commit; app-level actions. Single source of truth: [architecture/copilotkit-and-agents.md](../architecture/copilotkit-and-agents.md).

## Context (what the agent sees)

- **Shell**: `useCopilotReadable` in AppShell — activeWorkspaceId, openWorkspaceIds, workspace labels, editor summary.
- **Domain**: When a workspace is active, `useDomainCopilot(contract)` registers `contract.getContextSnapshot()` as readable (domain, workspaceId, selection, selectionSummary, domainState). Domain instructions come from `contract.getInstructions()`.

## Actions (what the agent can do)

- **Shell**: `switchWorkspace`, `openWorkspace`, `closeWorkspace` (no prefix).
- **Domain**: All actions from `contract.createActions()` with domain prefix (e.g. `forge_createNode`, `forge_executePlan`, `forge_commit`). Each registered via `useCopilotAction`.
- **App-level**: Registered in AppShell: `app_generateImage`, `app_respondWithStructure`. Use a neutral prefix so they don’t collide with domain actions.

## Suggestions and highlights

- **Suggestions**: `contract.getSuggestions()` → chips in chat.
- **Highlights**: After an action, handlers can call `onAIHighlight({ entities: { 'forge.node': [id] } })`; the UI highlights those entities briefly. Same `AIHighlightPayload` and `useAIHighlight` across domains.

## Plan–execute–review–commit

Forge (and any workspace that adopts it): create plan (no draft change) → execute plan (apply steps, set pending) → **WorkspaceReviewBar** (Revert / Accept) → commit (save). See §11 in [architecture/copilotkit-and-agents.md](../architecture/copilotkit-and-agents.md).

## What the AI can do (summary)

At full integration: read workspace and domain context; run shell and domain actions; for Forge, create/execute plan and commit after review; use app actions for image generation and structured output. Co-agents are documented but not used yet; see [co-agents-and-multi-agent.md](../co-agents-and-multi-agent.md).

**Next:** Back to [00 – Index](00-index.md) or reference docs (decisions, tech-stack, STATUS).

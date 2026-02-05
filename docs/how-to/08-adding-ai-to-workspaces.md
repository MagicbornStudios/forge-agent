# 08 - Adding AI to workspaces

How to add more AI to the app: domain actions, app-level actions, agents, and (future) graphs/subgraphs. Single source of truth for architecture: [architecture/copilotkit-and-agents.md](../architecture/copilotkit-and-agents.md).

## Overview

- **One CopilotKit provider**, one **OpenRouter** agent today. Model is resolved per request (model router or override).
- **Context** = shell (AppShell) + active domain contract when a workspace is mounted.
- **Actions** = shell (no prefix) + domain (`forge_` / `video_`) + app-level (`app_`). Only the active workspace's domain actions are registered.

## Adding domain actions

1. Implement or extend a **DomainCopilotContract** ([packages/shared/src/shared/copilot/types.ts](../../packages/shared/src/shared/copilot/types.ts)): `getContextSnapshot()`, `getInstructions()`, `createActions()`, `getSuggestions()`, `onAIHighlight` / `clearAIHighlights`.
2. In the workspace component, call **useDomainCopilot(contract, { toolsEnabled })**. Only one workspace is mounted at a time, so only that domain's actions are active.
3. **References:** Forge = [packages/domain-forge/src/copilot](../../packages/domain-forge/src/copilot), Video = [apps/studio/lib/domains/video/copilot](../../apps/studio/lib/domains/video/copilot).

Step-by-step: [adding-domain-actions.md](../adding-domain-actions.md).

## Adding app-level actions

1. Register in [AppShell.tsx](../../apps/studio/components/AppShell.tsx) with **useCopilotAction**: name prefix **`app_`** (e.g. `app_generateImage`, `app_respondWithStructure`).
2. Handler can call internal APIs (e.g. `/api/image-generate`, `/api/structured-output`). Optional **render** for chat UI; must return a **ReactElement** (no `null` -- use `<></>` as fallback).
3. Gate by capability (e.g. `CAPABILITIES.IMAGE_GENERATION`) and pass **available: 'disabled'** when the feature is off.

## Agents

- **Today:** Single agent in [apps/studio/app/api/copilotkit/route.ts](../../apps/studio/app/api/copilotkit/route.ts) (OpenRouter).
- **Adding another agent** (e.g. co-agent per workspace): see [co-agents-and-multi-agent.md](../co-agents-and-multi-agent.md). No code changes in this guide.

## Graphs / subgraphs (future)

We use a single "direct" OpenRouter agent today. If we later add LangGraph-style or multi-step agent graphs, they would be implemented in the **runtime** (e.g. new API route or agent definition), not in the domain contract. See CopilotKit docs (e.g. Direct to LLM / LangGraph) for reference.

## Conventions recap

- One contract per domain; **domain prefix** for domain actions; **`app_`** for app-level.
- Same number of actions every render; use **available: 'disabled'** when an action is contextually inactive.
- **OpenRouter** is the model provider for chat, image gen, and structured output.

**Next:** Back to [00 - Index](00-index.md) or [07 - Copilot and AI integration](07-copilot.md).

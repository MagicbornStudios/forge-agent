# Co-agents and multi-agent pattern

This doc describes how to add workspace- or editor-specific co-agents and how the main CopilotKit agent delegates.

## Current setup

- **One CopilotKit instance** at the App Shell (wraps the whole app).
- **Shell-level context and actions**: `useCopilotReadable` and `useCopilotAction` in `AppShell` expose `activeWorkspaceId`, `workspaceNames`, `switchWorkspace`, `openWorkspace`, `closeWorkspace`.
- **Per-workspace domain contract**: When a workspace is active (e.g. Forge), that workspace component calls `useForgeContract` / `useVideoContract` and `useDomainCopilot`, which register context, actions, and suggestions for that domain only. Only one workspace is visible at a time, so only one domain contract is active.

## Adding a co-agent for a workspace

For workspace-specific sub-tasks (e.g. "edit the graph in Forge" or "add a track in Video"), you can add a **co-agent** using CopilotKit's `useCoAgent` or the newer `useAgent` (v2) for multiple agents.

1. **useCoAgent**: Provides shared state and a single co-agent. Example:
   ```ts
   const { state, setState } = useCoAgent("forge-editor-agent");
   ```
   Use inside the workspace component (e.g. ForgeWorkspace) so the co-agent is scoped to that workspace. The main sidebar agent can delegate to it.

2. **useAgent (v2)**: Superset of useCoAgent; supports multiple agents, mutual awareness, shared state, time-travel. See [CopilotKit useAgent](https://docs.copilotkit.ai/reference/hooks/useAgent#multiple-agents) and [useCoAgent](https://docs.copilotkit.ai/reference/hooks/useCoAgent).

3. **Instructions**: Give the co-agent workspace-specific instructions (e.g. "You are the Forge graph editor agent. You can create nodes, connect edges, and reveal selection.") so the main agent knows when to hand off.

4. **Delegation**: The main agent uses tools or instructions to "invoke" the co-agent; exact API depends on CopilotKit version. Document the co-agent id and `whenToUse` in `WorkspaceAgentConfig` (see `packages/shared/src/shared/copilot/agent-types.ts`).

## Types and utilities

- **packages/shared/src/shared/copilot/agent-types.ts**: `AgentDelegationTarget`, `WorkspaceAgentConfig`. Use these to declare which workspace has an optional co-agent and how the main agent should delegate.

## Summary

| Layer        | Where              | What                                                                 |
|-------------|--------------------|----------------------------------------------------------------------|
| Shell       | AppShell           | Context: activeWorkspace, workspaceNames. Actions: switch/open/close. |
| Domain      | ForgeWorkspace etc.| Context + actions + suggestions from `useDomainCopilot(contract)`.   |
| Co-agent    | Optional per workspace | `useCoAgent(id)` or `useAgent({ agentId })` for sub-tasks.       |

Keep the main sidebar as the primary agent; add co-agents only when you need dedicated sub-agents (e.g. long-running editor tasks or separate chat threads per workspace).

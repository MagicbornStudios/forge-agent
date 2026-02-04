/**
 * Shared types for CopilotKit agent layering and delegation.
 *
 * - **Unified agent**: Single CopilotKit instance at App Shell; receives shell context + domain context when a workspace is active.
 * - **Per-workspace**: Domain contract (context + actions) registered only when that workspace is mounted/active.
 * - **Co-agents**: Optional sub-agents (e.g. useCoAgent or useAgent) for workspace- or editor-specific tasks; main chat can delegate.
 *
 * @see docs/co-agents-and-multi-agent.md
 */

/** Identifies an agent or co-agent for delegation. */
export type AgentId = string;

/** Human-readable name for UI and prompts. */
export type AgentDisplayName = string;

export interface AgentDelegationTarget {
  id: AgentId;
  name: AgentDisplayName;
  /** Short description for the main agent (when to delegate). */
  whenToUse: string;
}

/**
 * Optional agent config per workspace. Used to register co-agents or
 * document which agent handles which scope.
 */
export interface WorkspaceAgentConfig {
  workspaceId: string;
  /** Main agent gets domain context from the contract; no separate co-agent required. */
  useDomainContract: true;
  /** Optional: co-agent id for useCoAgent / useAgent (e.g. "forge-editor-agent"). */
  coAgentId?: AgentId;
  /** Optional: display name for the co-agent. */
  coAgentName?: AgentDisplayName;
}

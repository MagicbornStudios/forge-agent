/**
 * Core contracts for CopilotKit domain integration.
 *
 * Every workspace domain (forge, video, writer, etc.) implements
 * `DomainCopilotContract` to get context, actions, suggestions,
 * and highlights wired up via a single `useDomainCopilot()` call.
 */

import type { ReactNode } from 'react';
import type { Selection } from '@forge/shared/workspace/selection';

// ---------------------------------------------------------------------------
// Action result
// ---------------------------------------------------------------------------

/** Standard result returned from any copilot action across all domains. */
export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  /** IDs of entities the AI touched (for highlighting). */
  affectedIds?: string[];
}

// ---------------------------------------------------------------------------
// AI highlights
// ---------------------------------------------------------------------------

/**
 * Payload for AI highlights, domain-agnostic.
 *
 * Keys are entity types (e.g. `'forge.node'`, `'video.track'`),
 * values are arrays of entity IDs to highlight.
 */
export interface AIHighlightPayload {
  entities: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Context snapshot
// ---------------------------------------------------------------------------

/** Shape of the readable context exposed to CopilotKit per domain. */
export interface DomainContextSnapshot {
  domain: string;
  workspaceId: string;
  selection: Selection | null;
  selectionSummary: string | null;
  /** Domain-specific state blob (node count, track count, etc.). */
  domainState: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Chat suggestions
// ---------------------------------------------------------------------------

/** A single contextual suggestion shown as a chip in the chat UI. */
export interface DomainSuggestion {
  title: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Action config
// ---------------------------------------------------------------------------

/** Parameter descriptor for a copilot action. */
export interface CopilotActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'string[]' | 'number[]';
  description: string;
  required?: boolean;
  enum?: string[];
}

/**
 * Configuration for a single CopilotKit action.
 *
 * Mirrors the shape expected by `useCopilotAction` with optional
 * `render` for generative UI (chat-embedded components).
 */
export interface CopilotActionConfig {
  name: string;
  description: string;
  parameters: CopilotActionParameter[];
  /** Handler executed when the agent calls this action. */
  handler?: (args: Record<string, unknown>) => Promise<ActionResult>;
  /**
   * Optional render function for generative UI.
   * When provided, the action renders a React component in the chat.
   */
  render?: (props: { status: string; args: Record<string, unknown>; result?: ActionResult }) => ReactNode;
  /** Set to `'disabled'` to keep the action registered but inactive. */
  available?: 'enabled' | 'disabled';
}

// ---------------------------------------------------------------------------
// Domain contract
// ---------------------------------------------------------------------------

/**
 * The contract every domain implements to integrate with CopilotKit.
 *
 * A workspace component calls `useDomainCopilot(contract, options?)` once to
 * register context, actions, suggestions, and instructions.
 */
export interface DomainCopilotContract {
  /** Stable domain identifier (e.g. `'forge'`, `'video'`, `'writer'`). */
  domain: string;

  /** Build the readable context snapshot for CopilotKit. */
  getContextSnapshot(): DomainContextSnapshot;

  /** Additional instructions injected when this domain is active. */
  getInstructions(): string;

  /**
   * Factory: produce the array of CopilotKit action configs.
   *
   * **Important:** Must always return the same number of actions between
   * renders (React hook rules). Use `available: 'disabled'` for contextually
   * inapplicable actions.
   */
  createActions(): CopilotActionConfig[];

  /** Factory: produce context-aware chat suggestions. */
  getSuggestions(): DomainSuggestion[];

  /** Handle an AI highlight event (domain decides how to show it). */
  onAIHighlight(payload: AIHighlightPayload): void;

  /** Clear all AI highlights. */
  clearAIHighlights(): void;
}

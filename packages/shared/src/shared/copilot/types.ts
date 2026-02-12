/**
 * Core contracts for domain integration.
 *
 * CopilotKit removed; types kept for legacy domain copilot code (context, suggestions, action shapes).
 * AIHighlightPayload moved to @forge/shared/assistant.
 */

import type { ReactNode } from 'react';
import type { Selection } from '@forge/shared';

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
// AI highlights (prefer @forge/shared/assistant for new code)
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

/** Shape of the readable context exposed per domain. */
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
// Action config (generic; CopilotKit removed)
// ---------------------------------------------------------------------------

/** Parameter descriptor for an action. */
export interface CopilotActionParameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}

/** Configuration for a domain action (legacy). */
export interface CopilotActionConfig<T extends CopilotActionParameter[] | [] = []> {
  name: string;
  description: string;
  parameters?: T;
  handler?: (args: Record<string, unknown>) => Promise<ActionResult>;
  render?: (props: CopilotActionRenderProps<T>) => ReactNode;
  available?: 'enabled' | 'disabled';
}

/** Render props for generative UI (status, args, result). */
export interface CopilotActionRenderProps<T extends CopilotActionParameter[] | [] = []> {
  args: Record<string, unknown>;
  status: 'idle' | 'inProgress' | 'complete' | 'error';
  result?: ActionResult;
}

/** Shorthand when action has no parameters. */
export type CopilotActionRenderPropsNoArgs = CopilotActionRenderProps<[]>;

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

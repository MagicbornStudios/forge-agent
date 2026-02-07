/**
 * Core contracts for CopilotKit domain integration.
 *
 * Every workspace domain (forge, video, writer, etc.) implements
 * `DomainCopilotContract` to get context, actions, suggestions,
 * and highlights wired up via a single `useDomainCopilot()` call.
 */

import type { Parameter } from '@copilotkit/shared';
import type {
  FrontendAction,
  ActionRenderProps,
  ActionRenderPropsNoArgs,
} from '@copilotkit/react-core';
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

/** Parameter descriptor for a copilot action (CopilotKit Parameter). */
export type CopilotActionParameter = Parameter;

/**
 * Configuration for a single CopilotKit action.
 *
 * Alias of CopilotKit FrontendAction so it stays compatible with useCopilotAction.
 */
export type CopilotActionConfig<T extends Parameter[] | [] = []> = FrontendAction<T>;

/** Render props for generative UI actions (re-exported for convenience). */
export type CopilotActionRenderProps<T extends Parameter[] | [] = []> = ActionRenderProps<T>;

/** Render props when actions have no args (re-exported for convenience). */
export type CopilotActionRenderPropsNoArgs<T extends Parameter[] | [] = []> = ActionRenderPropsNoArgs<T>;

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

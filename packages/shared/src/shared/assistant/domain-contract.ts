import type { ReactNode } from 'react';

/**
 * Domain assistant contract for Assistant UI integration.
 *
 * Replaces CopilotKit DomainCopilotContract. Each domain implements this
 * to wire context, tools, suggestions, and highlights via useDomainAssistant.
 */

/** Context snapshot passed to tool execute functions. */
export interface DomainContextSnapshot {
  domain: string;
  /** Domain-specific state (node count, selection, etc.). */
  domainState: Record<string, unknown>;
  /** Human-readable summary of current selection, if any. */
  selectionSummary?: string | null;
}

/** Context passed to each tool's execute function. */
export interface DomainToolContext {
  snapshot: DomainContextSnapshot;
  /** Emit custom events to the assistant (if supported). */
  emit?: (event: unknown) => void;
}

/** JSON Schema for tool parameters (compatible with AI SDK / OpenRouter). */
export interface DomainToolParameters {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

/** A single domain tool definition. */
export interface DomainTool {
  domain: string;
  name: string;
  description: string;
  parameters: DomainToolParameters;
  execute: (args: unknown, context: DomainToolContext) => Promise<unknown>;
  /** Optional custom UI for tool results (e.g. Plan for forge_createPlan). */
  render?: (result: unknown) => ReactNode;
}

/** Contract every domain implements for Assistant UI. */
export interface DomainAssistantContract {
  domain: string;
  getContextSnapshot(): DomainContextSnapshot;
  getInstructions(): string;
  createTools(): DomainTool[];
  getSuggestions(): Array<{ title: string; message: string }>;
  onHighlight(entities: Record<string, string[]>): void;
  clearHighlights(): void;
}

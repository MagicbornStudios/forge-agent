'use client';

import { useAssistantInstructions } from '@assistant-ui/react';
import type { DomainAssistantContract } from './domain-contract';

export interface UseDomainAssistantOptions {
  enabled?: boolean;
}

/**
 * Hook to wire a domain contract with Assistant UI.
 *
 * Must run inside AssistantRuntimeProvider. Registers instructions from the contract.
 * Tool registration happens via DomainToolsRenderer (mount it as a sibling).
 *
 * @returns Highlight handlers for the domain to use when AI affects entities.
 */
export function useDomainAssistant(
  contract: DomainAssistantContract,
  options?: UseDomainAssistantOptions
) {
  const { enabled = true } = options ?? {};

  useAssistantInstructions({
    instruction: enabled ? contract.getInstructions() : '',
    disabled: !enabled,
  });

  return {
    onHighlight: contract.onHighlight,
    clearHighlights: contract.clearHighlights,
  };
}

'use client';

import { useCopilotAdditionalInstructions } from '@copilotkit/react-core';
import { useDomainCopilotContext } from './use-domain-copilot-context';
import { useDomainCopilotActions } from './use-domain-copilot-actions';
import { useDomainCopilotSuggestions } from './use-domain-copilot-suggestions';
import type { DomainCopilotContract } from './types';

/**
 * Single orchestrator hook for CopilotKit domain integration.
 *
 * Call once in each domain's workspace component. Registers:
 * - Readable context (via `useCopilotReadable`)
 * - Actions (via `useCopilotAction` per action)
 * - Chat suggestions (via `useCopilotChatSuggestions`)
 *
 * Domain-specific instructions come from the contract and are
 * included in the context snapshot for the LLM.
 */
export function useDomainCopilot(
  contract: DomainCopilotContract,
  options?: { toolsEnabled?: boolean },
): void {
  const instructions = contract.getInstructions();
  const hasInstructions = typeof instructions === 'string' && instructions.trim().length > 0;

  useDomainCopilotContext(contract);
  useCopilotAdditionalInstructions({
    instructions,
    available: hasInstructions ? 'enabled' : 'disabled',
  });
  useDomainCopilotActions(contract, options);
  useDomainCopilotSuggestions(contract);
}

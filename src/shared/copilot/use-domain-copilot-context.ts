'use client';

import { useCopilotReadable } from '@copilotkit/react-core';
import type { DomainCopilotContract } from './types';

/**
 * Register the domain's context snapshot as CopilotKit readable context.
 *
 * Call once per domain workspace component (via `useDomainCopilot`).
 */
export function useDomainCopilotContext(contract: DomainCopilotContract): void {
  const snapshot = contract.getContextSnapshot();

  useCopilotReadable({
    description: `Current ${contract.domain} workspace context: selection, state, and metadata for AI.`,
    value: snapshot,
  });
}

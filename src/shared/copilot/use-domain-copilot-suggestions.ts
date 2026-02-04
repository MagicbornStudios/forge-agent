'use client';

import { useMemo } from 'react';
import { useCopilotChatSuggestions } from '@copilotkit/react-ui';
import type { DomainCopilotContract } from './types';

/**
 * Register context-aware chat suggestions for the active domain.
 *
 * Suggestions appear as clickable chips in the CopilotKit sidebar.
 */
export function useDomainCopilotSuggestions(contract: DomainCopilotContract): void {
  const suggestions = useMemo(() => contract.getSuggestions(), [contract]);

  useCopilotChatSuggestions({
    instructions: `Suggest actions for the ${contract.domain} workspace based on current state.`,
    minSuggestions: suggestions.length > 0 ? 1 : 0,
    maxSuggestions: Math.min(suggestions.length, 3),
  });
}

'use client';

import { useMemo } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import type { DomainCopilotContract } from './types';

export interface DomainCopilotActionOptions {
  toolsEnabled?: boolean;
}

/**
 * Register all CopilotKit actions for a domain.
 *
 * Calls `contract.createActions()` once, then registers each action
 * individually via `useCopilotAction` (React hook rules require one
 * call per action).
 *
 * **Constraint:** `createActions()` must always return the same number
 * of actions between renders. Use `available: 'disabled'` for
 * contextually inapplicable ones.
 */
export function useDomainCopilotActions(
  contract: DomainCopilotContract,
  options?: DomainCopilotActionOptions,
): void {
  const actions = useMemo(() => contract.createActions(), [contract]);
  const toolsEnabled = options?.toolsEnabled ?? true;
  const preparedActions = useMemo(
    () =>
      toolsEnabled
        ? actions
        : actions.map((action) => ({
            ...action,
            available: 'disabled' as const,
          })),
    [actions, toolsEnabled],
  );

  // Register each action individually.
  // Safe as long as the array length is stable between renders.
  for (const action of preparedActions) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCopilotAction(action as Parameters<typeof useCopilotAction>[0]);
  }
}

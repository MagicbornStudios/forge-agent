'use client';

import { useMemo } from 'react';
import type { DomainCopilotContract, AIHighlightPayload } from '@/shared/copilot/types';
import type { Selection } from '@/shared/workspace/selection';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@/types/graph';
import { createForgeActions } from './actions';
import { buildForgeContext } from './context';
import { getForgeSuggestions } from './suggestions';

/** Dependencies required to build the forge copilot contract. */
export interface ForgeCopilotDeps {
  graph: ForgeGraphDoc | null;
  selection: Selection | null;
  isDirty: boolean;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
  openOverlay: (id: string, payload?: Record<string, unknown>) => void;
  revealSelection: () => void;
  onAIHighlight: (payload: AIHighlightPayload) => void;
  clearAIHighlights: () => void;
  createNodeOverlayId: string;
}

/**
 * Build the forge domain's `DomainCopilotContract`.
 *
 * Usage in the forge workspace component:
 * ```ts
 * const forgeContract = useForgeContract(deps);
 * useDomainCopilot(forgeContract);
 * ```
 */
export function useForgeContract(deps: ForgeCopilotDeps): DomainCopilotContract {
  const {
    graph,
    selection,
    isDirty,
    applyOperations,
    openOverlay,
    revealSelection,
    onAIHighlight,
    clearAIHighlights,
    createNodeOverlayId,
  } = deps;

  return useMemo<DomainCopilotContract>(
    () => ({
      domain: 'forge',

      getContextSnapshot: () => buildForgeContext({ graph, selection, isDirty }),

      getInstructions: () =>
        'You are helping edit a dialogue graph. Available node types: CHARACTER, PLAYER, CONDITIONAL. ' +
        'Use forge_* actions to modify the graph. Call forge_getGraph before creating edges to get node IDs. ' +
        'When the user asks to create dialogue, use forge_createNode and forge_createEdge together.',

      createActions: () =>
        createForgeActions({
          getGraph: () => graph,
          applyOperations,
          onAIHighlight,
          openOverlay,
          revealSelection,
          createNodeOverlayId,
        }),

      getSuggestions: () => getForgeSuggestions({ graph, selection }),

      onAIHighlight,
      clearAIHighlights,
    }),
    [graph, selection, isDirty, applyOperations, openOverlay, revealSelection, onAIHighlight, clearAIHighlights, createNodeOverlayId],
  );
}

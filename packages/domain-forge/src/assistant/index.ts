'use client';

import { useMemo } from 'react';
import type { DomainAssistantContract, DomainContextSnapshot } from '@forge/shared/assistant';
import type { Selection } from '@forge/shared';
import type { ForgeGraphDoc } from '@forge/types/graph';
import { buildForgeContext } from '../copilot/context';
import { getForgeSuggestions } from '../copilot/suggestions';
import { createForgeAssistantTools } from './tools';

export { ForgePlanToolUI, ForgePlanExecuteProvider } from './forge-plan-tool-ui';

/** Dependencies for the Forge assistant contract (matches copilot deps shape for coexistence). */
export interface ForgeAssistantDeps {
  graph: ForgeGraphDoc | null;
  selection: Selection | null;
  isDirty: boolean;
  applyOperations: (ops: import('@forge/types/graph').ForgeGraphPatchOp[]) => void;
  onAIHighlight: (entities: Record<string, string[]>) => void;
  clearAIHighlights: () => void;
  /** Optional: plan API (Slice 5); openOverlay, revealSelection, etc. (Slice 6). */
  openOverlay?: (id: string, payload?: Record<string, unknown>) => void;
  revealSelection?: () => void;
  createNodeOverlayId?: string;
  createPlanApi?: (goal: string, graphSummary: unknown) => Promise<{ steps: unknown[] }>;
  createStoryBuilderApi?: (
    premise: string,
    options?: { characterCount?: number; sceneCount?: number }
  ) => Promise<{
    steps: unknown[];
    characters: Array<{ name: string; description?: string; personality?: string }>;
    scenes: Array<{ title: string; speaker: string; dialogue: string }>;
    summary: string;
  }>;
  setPendingFromPlan?: (value: boolean) => void;
  commitGraph?: () => Promise<void>;
}

/**
 * Build the Forge domain's DomainAssistantContract.
 * Returns a contract with forge_getGraph and forge_createNode (Slice 3).
 */
export function useForgeAssistantContract(deps: ForgeAssistantDeps): DomainAssistantContract {
  const {
    graph,
    selection,
    isDirty,
    applyOperations,
    onAIHighlight,
    clearAIHighlights,
    createPlanApi,
    createStoryBuilderApi,
    setPendingFromPlan,
    openOverlay,
    revealSelection,
    createNodeOverlayId,
  } = deps;

  return useMemo<DomainAssistantContract>(
    () => ({
      domain: 'forge',

      getContextSnapshot: (): DomainContextSnapshot => {
        const ctx = buildForgeContext({ graph, selection, isDirty });
        return {
          domain: ctx.domain,
          domainState: ctx.domainState,
          selectionSummary: ctx.selectionSummary,
        };
      },

      getInstructions: () =>
        'You are helping edit a graph (nodes and edges). This graph represents dialogue/narrative. ' +
        'Available node types: CHARACTER, PLAYER, CONDITIONAL. ' +
        'Use forge_* tools to modify the graph. Call forge_getGraph before creating edges to get node IDs. ' +
        'When the user asks for a premise-driven scaffold, use forge_createStoryFromPremise. ' +
        'For planning, use forge_createPlan to propose changes; the user can Apply or Request Changes. ' +
        'When the user asks to create dialogue, use forge_createNode and forge_createEdge together.',

      createTools: () =>
        createForgeAssistantTools({
          getGraph: () => graph,
          applyOperations,
          onAIHighlight,
          createPlanApi,
          createStoryBuilderApi,
          setPendingFromPlan,
          openOverlay,
          revealSelection,
          createNodeOverlayId,
        }),

      getSuggestions: () => getForgeSuggestions({ graph, selection }),

      onHighlight: (entities) => onAIHighlight({ entities }),
      clearHighlights: clearAIHighlights,
    }),
    [
      graph,
      selection,
      isDirty,
      applyOperations,
      onAIHighlight,
      clearAIHighlights,
      createPlanApi,
      createStoryBuilderApi,
      setPendingFromPlan,
      openOverlay,
      revealSelection,
      createNodeOverlayId,
    ]
  );
}

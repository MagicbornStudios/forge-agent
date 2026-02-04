'use client';

import { useMemo } from 'react';
import { useCopilotAction } from '@copilotkit/react-core';
import { createGraphEditorActions, type AIChangePayload } from '@/lib/copilot-actions';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@forge/types/graph';
import type { ForgeNodeType } from '@forge/types/graph';

export interface UseForgeCopilotActionsParams {
  graph: ForgeGraphDoc | null;
  applyOperations: (operations: ForgeGraphPatchOp[]) => void;
  openOverlay: (id: string, payload?: Record<string, unknown>) => void;
  revealSelection: () => void;
  onAIChange?: (payload: AIChangePayload) => void;
  /** Overlay id for the "Create node" modal (e.g. 'create-node'). */
  createNodeOverlayId: string;
}

/**
 * Registers all CopilotKit actions for the Forge workspace: graph ops (createNode, updateNode,
 * deleteNode, createEdge, getGraph) plus openCreateNodeModal and revealSelection.
 * Call once in the Forge Workspace component so context + actions are in one place.
 */
export function useForgeCopilotActions({
  graph,
  applyOperations,
  openOverlay,
  revealSelection,
  onAIChange,
  createNodeOverlayId,
}: UseForgeCopilotActionsParams): void {
  const graphActions = useMemo(
    () =>
      createGraphEditorActions({
        getGraph: () => graph,
        applyOperations,
        onAIChange,
      }),
    [graph, applyOperations, onAIChange]
  );

  useCopilotAction(graphActions[0]);
  useCopilotAction(graphActions[1]);
  useCopilotAction(graphActions[2]);
  useCopilotAction(graphActions[3]);
  useCopilotAction(graphActions[4]);

  const openCreateNodeModal = useMemo(
    () => ({
      name: 'openCreateNodeModal',
      description:
        'Open the "Create node" overlay so the user can add a new dialogue or choice node. Optionally pass nodeType, label, content, or speaker to pre-fill the form.',
      parameters: [
        { name: 'nodeType', type: 'string' as const, description: 'One of: CHARACTER, PLAYER, CONDITIONAL', required: false },
        { name: 'label', type: 'string' as const, description: 'Pre-fill label', required: false },
        { name: 'content', type: 'string' as const, description: 'Pre-fill content', required: false },
        { name: 'speaker', type: 'string' as const, description: 'Pre-fill speaker', required: false },
      ],
      handler: async ({ nodeType, label, content, speaker }: { nodeType?: string; label?: string; content?: string; speaker?: string }) => {
        openOverlay(createNodeOverlayId, {
          nodeType: nodeType as ForgeNodeType | undefined,
          label,
          content,
          speaker,
        });
        return { success: true, message: 'Opened Create node overlay.' };
      },
    }),
    [openOverlay, createNodeOverlayId]
  );
  useCopilotAction(openCreateNodeModal);

  const revealSelectionAction = useMemo(
    () => ({
      name: 'revealSelection',
      description:
        'Fit the viewport to the current selection (selected node or edge), or fit all nodes if nothing is selected. Use when the user asks to "zoom to selection" or "show the selected node".',
      parameters: [],
      handler: async () => {
        revealSelection();
        return { success: true, message: 'Viewport fitted to selection.' };
      },
    }),
    [revealSelection]
  );
  useCopilotAction(revealSelectionAction);
}


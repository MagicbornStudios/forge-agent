import type { CopilotActionConfig, AIHighlightPayload } from '@forge/shared/copilot/types';
import type { ForgeGraphDoc, ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';
import { FORGE_NODE_TYPE } from '@forge/types/graph';
import { renderNodeCreated, renderDeleteNodeResult, renderNodeUpdated } from './generative-ui';

export interface ForgeActionsDeps {
  getGraph: () => ForgeGraphDoc | null;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
  onAIHighlight: (payload: AIHighlightPayload) => void;
  openOverlay: (id: string, payload?: Record<string, unknown>) => void;
  revealSelection: () => void;
  createNodeOverlayId: string;
}

/**
 * Factory: produce all CopilotKit action configs for the forge domain.
 *
 * All action names are prefixed with `forge_` to prevent collisions
 * when multiple domains register simultaneously.
 */
export function createForgeActions(deps: ForgeActionsDeps): CopilotActionConfig[] {
  const { getGraph, applyOperations, onAIHighlight, openOverlay, revealSelection, createNodeOverlayId } = deps;

  return [
    // -----------------------------------------------------------------------
    // forge_createNode
    // -----------------------------------------------------------------------
    {
      name: 'forge_createNode',
      description:
        'Create a new node in the dialogue graph. Use this when the user wants to add a character dialogue, player choice, or conditional logic node.',
      parameters: [
        {
          name: 'nodeType',
          type: 'string' as const,
          description: `The type of node to create. Must be one of: ${Object.values(FORGE_NODE_TYPE).join(', ')}`,
          required: true,
        },
        { name: 'label', type: 'string' as const, description: 'A label for the node', required: true },
        { name: 'content', type: 'string' as const, description: 'The dialogue content or text', required: false },
        { name: 'speaker', type: 'string' as const, description: 'The speaker name for dialogue nodes', required: false },
        { name: 'x', type: 'number' as const, description: 'X position', required: false },
        { name: 'y', type: 'number' as const, description: 'Y position', required: false },
      ],
      handler: async (args: Record<string, unknown>) => {
        const { nodeType, label, content, speaker, x, y } = args;
        const graph = getGraph();
        if (!graph) return { success: false, message: 'No active graph' };

        const nodeId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        const position = {
          x: (x as number | undefined) ?? Math.random() * 500,
          y: (y as number | undefined) ?? Math.random() * 500,
        };

        applyOperations([
          {
            type: 'createNode',
            nodeType: nodeType as ForgeNodeType,
            position,
            data: {
              label: label as string | undefined,
              content: content as string | undefined,
              speaker: speaker as string | undefined,
            },
            id: nodeId,
          },
        ]);
        onAIHighlight({ entities: { 'forge.node': [nodeId] } });

        return { success: true, message: `Created ${String(nodeType)} node: ${String(label)}`, data: { nodeId } };
      },
      render: renderNodeCreated,
    },

    // -----------------------------------------------------------------------
    // forge_updateNode
    // -----------------------------------------------------------------------
    {
      name: 'forge_updateNode',
      description:
        'Update properties of an existing node. Use this when the user wants to change node content, label, or other properties.',
      parameters: [
        { name: 'nodeId', type: 'string' as const, description: 'The ID of the node to update', required: true },
        { name: 'label', type: 'string' as const, description: 'New label', required: false },
        { name: 'content', type: 'string' as const, description: 'New content', required: false },
        { name: 'speaker', type: 'string' as const, description: 'New speaker name', required: false },
      ],
      handler: async (args: Record<string, unknown>) => {
        const { nodeId, label, content, speaker } = args;
        const updates: Record<string, unknown> = {};
        if (label !== undefined) updates.label = label;
        if (content !== undefined) updates.content = content;
        if (speaker !== undefined) updates.speaker = speaker;

        applyOperations([{ type: 'updateNode', nodeId: nodeId as string, updates }]);
        onAIHighlight({ entities: { 'forge.node': [nodeId as string] } });

        return { success: true, message: `Updated node ${String(nodeId)}` };
      },
      render: renderNodeUpdated,
    },

    // -----------------------------------------------------------------------
    // forge_deleteNode
    // -----------------------------------------------------------------------
    {
      name: 'forge_deleteNode',
      description: 'Delete a node from the graph. This also removes connected edges.',
      parameters: [
        { name: 'nodeId', type: 'string' as const, description: 'The ID of the node to delete', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        const { nodeId } = args;
        applyOperations([{ type: 'deleteNode', nodeId: nodeId as string }]);
        return { success: true, message: `Deleted node ${String(nodeId)}` };
      },
      render: renderDeleteNodeResult,
    },

    // -----------------------------------------------------------------------
    // forge_createEdge
    // -----------------------------------------------------------------------
    {
      name: 'forge_createEdge',
      description:
        'Create a connection between two nodes. Call forge_getGraph to get node ids, or use nodeId from forge_createNode response.',
      parameters: [
        { name: 'sourceNodeId', type: 'string' as const, description: 'Source node id', required: true },
        { name: 'targetNodeId', type: 'string' as const, description: 'Target node id', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        const { sourceNodeId, targetNodeId } = args;
        applyOperations([
          { type: 'createEdge', source: sourceNodeId as string, target: targetNodeId as string },
        ]);
        const graphAfter = getGraph();
        const newEdge = graphAfter?.flow.edges.find(
          (e) => e.source === sourceNodeId && e.target === targetNodeId,
        );
        if (newEdge) onAIHighlight({ entities: { 'forge.edge': [newEdge.id] } });

        return { success: true, message: `Connected ${String(sourceNodeId)} to ${String(targetNodeId)}` };
      },
    },

    // -----------------------------------------------------------------------
    // forge_getGraph
    // -----------------------------------------------------------------------
    {
      name: 'forge_getGraph',
      description:
        'Get the current graph state including every node id and edge. Call this before forge_createEdge to get source and target node ids.',
      parameters: [],
      handler: async () => {
        const graph = getGraph();
        if (!graph) return { success: false, message: 'No active graph' };

        return {
          success: true,
          message: 'Graph retrieved',
          data: {
            title: graph.title,
            nodeCount: graph.flow.nodes.length,
            edgeCount: graph.flow.edges.length,
            nodes: graph.flow.nodes.map((n) => ({
              id: n.id,
              type: n.data.type,
              label: n.data.label,
              content: n.data.content,
              speaker: n.data.speaker,
            })),
            edges: graph.flow.edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          },
        };
      },
    },

    // -----------------------------------------------------------------------
    // forge_openCreateNodeModal
    // -----------------------------------------------------------------------
    {
      name: 'forge_openCreateNodeModal',
      description:
        'Open the "Create node" overlay so the user can add a new node via the form. Optionally pre-fill fields.',
      parameters: [
        { name: 'nodeType', type: 'string' as const, description: 'One of: CHARACTER, PLAYER, CONDITIONAL', required: false },
        { name: 'label', type: 'string' as const, description: 'Pre-fill label', required: false },
        { name: 'content', type: 'string' as const, description: 'Pre-fill content', required: false },
        { name: 'speaker', type: 'string' as const, description: 'Pre-fill speaker', required: false },
      ],
      handler: async (args: Record<string, unknown>) => {
        openOverlay(createNodeOverlayId, {
          nodeType: args.nodeType as ForgeNodeType | undefined,
          label: args.label as string | undefined,
          content: args.content as string | undefined,
          speaker: args.speaker as string | undefined,
        });
        return { success: true, message: 'Opened Create node overlay.' };
      },
    },

    // -----------------------------------------------------------------------
    // forge_revealSelection
    // -----------------------------------------------------------------------
    {
      name: 'forge_revealSelection',
      description:
        'Fit the viewport to the current selection (selected node or edge), or fit all nodes if nothing is selected.',
      parameters: [],
      handler: async () => {
        revealSelection();
        return { success: true, message: 'Viewport fitted to selection.' };
      },
    },
  ];
}


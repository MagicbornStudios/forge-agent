import type { ForgeGraphDoc, ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';
import { FORGE_NODE_TYPE } from '@forge/types/graph';

export interface AIChangePayload {
  nodeIds?: string[];
  edgeIds?: string[];
}

export interface GraphEditorActions {
  getGraph: () => ForgeGraphDoc | null;
  applyOperations: (operations: ForgeGraphPatchOp[]) => void;
  onAIChange?: (payload: AIChangePayload) => void;
}

export function createGraphEditorActions(actions: GraphEditorActions) {
  return [
    {
      name: 'createNode',
      description: 'Create a new node in the graph. Use this when the user wants to add a character dialogue, player choice, or conditional logic node.',
      parameters: [
        {
          name: 'nodeType',
          type: 'string' as const,
          description: `The type of node to create. Must be one of: ${Object.values(FORGE_NODE_TYPE).join(', ')}`,
          required: true,
        },
        {
          name: 'label',
          type: 'string' as const,
          description: 'A label for the node',
          required: true,
        },
        {
          name: 'content',
          type: 'string' as const,
          description: 'The dialogue content or text for the node',
          required: false,
        },
        {
          name: 'speaker',
          type: 'string' as const,
          description: 'The speaker name for dialogue nodes',
          required: false,
        },
        {
          name: 'x',
          type: 'number' as const,
          description: 'X position for the node',
          required: false,
        },
        {
          name: 'y',
          type: 'number' as const,
          description: 'Y position for the node',
          required: false,
        },
      ],
      handler: async ({ nodeType, label, content, speaker, x, y }: any) => {
        const graph = actions.getGraph();
        if (!graph) {
          return { success: false, message: 'No active graph' };
        }

        const nodeId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        const position = {
          x: x ?? Math.random() * 500,
          y: y ?? Math.random() * 500,
        };

        const operation: ForgeGraphPatchOp = {
          type: 'createNode',
          nodeType: nodeType as ForgeNodeType,
          position,
          data: { label, content, speaker },
          id: nodeId,
        };

        actions.applyOperations([operation]);
        actions.onAIChange?.({ nodeIds: [nodeId] });

        return {
          success: true,
          message: `Created ${nodeType} node: ${label}`,
          nodeId,
        };
      },
    },
    {
      name: 'updateNode',
      description: 'Update properties of an existing node. Use this when the user wants to change node content, label, or other properties.',
      parameters: [
        {
          name: 'nodeId',
          type: 'string' as const,
          description: 'The ID of the node to update',
          required: true,
        },
        {
          name: 'label',
          type: 'string' as const,
          description: 'New label for the node',
          required: false,
        },
        {
          name: 'content',
          type: 'string' as const,
          description: 'New content for the node',
          required: false,
        },
        {
          name: 'speaker',
          type: 'string' as const,
          description: 'New speaker name',
          required: false,
        },
      ],
      handler: async ({ nodeId, label, content, speaker }: any) => {
        const updates: any = {};
        if (label !== undefined) updates.label = label;
        if (content !== undefined) updates.content = content;
        if (speaker !== undefined) updates.speaker = speaker;

        const operation: ForgeGraphPatchOp = {
          type: 'updateNode',
          nodeId,
          updates,
        };

        actions.applyOperations([operation]);
        actions.onAIChange?.({ nodeIds: [nodeId] });

        return {
          success: true,
          message: `Updated node ${nodeId}`,
        };
      },
    },
    {
      name: 'deleteNode',
      description: 'Delete a node from the graph. Use this when the user wants to remove a node.',
      parameters: [
        {
          name: 'nodeId',
          type: 'string' as const,
          description: 'The ID of the node to delete',
          required: true,
        },
      ],
      handler: async ({ nodeId }: any) => {
        const operation: ForgeGraphPatchOp = {
          type: 'deleteNode',
          nodeId,
        };

        actions.applyOperations([operation]);

        return {
          success: true,
          message: `Deleted node ${nodeId}`,
        };
      },
    },
    {
      name: 'createEdge',
      description: 'Create a connection between two nodes. Call getGraph to get node ids, or use nodeId from createNode response.',
      parameters: [
        {
          name: 'sourceNodeId',
          type: 'string' as const,
          description: 'Source node id (from getGraph or createNode)',
          required: true,
        },
        {
          name: 'targetNodeId',
          type: 'string' as const,
          description: 'Target node id (from getGraph or createNode)',
          required: true,
        },
      ],
      handler: async ({ sourceNodeId, targetNodeId }: any) => {
        const operation: ForgeGraphPatchOp = {
          type: 'createEdge',
          source: sourceNodeId,
          target: targetNodeId,
        };

        actions.applyOperations([operation]);
        const graphAfter = actions.getGraph();
        const newEdge = graphAfter?.flow.edges.find(
          (e) => e.source === sourceNodeId && e.target === targetNodeId
        );
        if (newEdge) actions.onAIChange?.({ edgeIds: [newEdge.id] });

        return {
          success: true,
          message: `Connected ${sourceNodeId} to ${targetNodeId}`,
        };
      },
    },
    {
      name: 'getGraph',
      description: 'Get the current graph state including every node id and edge. Call this before createEdge to get source and target node ids.',
      parameters: [],
      handler: async () => {
        const graph = actions.getGraph();
        if (!graph) {
          return { success: false, message: 'No active graph' };
        }

        return {
          success: true,
          graph: {
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
  ];
}


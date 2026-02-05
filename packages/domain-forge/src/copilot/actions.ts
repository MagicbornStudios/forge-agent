import type { CopilotActionConfig, AIHighlightPayload } from '@forge/shared/copilot/types';
import type { ReactNode } from 'react';
import type { ForgeGraphDoc, ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';
import { FORGE_NODE_TYPE } from '@forge/types/graph';
import { renderNodeCreated, renderDeleteNodeResult, renderNodeUpdated } from './generative-ui';
import { planStepToOp } from './plan-utils';

export interface ForgeActionsDeps {
  getGraph: () => ForgeGraphDoc | null;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
  onAIHighlight: (payload: AIHighlightPayload) => void;
  openOverlay: (id: string, payload?: Record<string, unknown>) => void;
  revealSelection: () => void;
  createNodeOverlayId: string;
  /** Optional: plan API for forge_createPlan. When absent, createPlan is no-op. */
  createPlanApi?: (goal: string, graphSummary: unknown) => Promise<{ steps: unknown[] }>;
  /** Optional: set pending-from-plan flag for review UI. */
  setPendingFromPlan?: (value: boolean) => void;
  /** Optional: persist draft (save). Used by forge_commit. */
  commitGraph?: () => Promise<void>;
  /** Optional: render plan UI in chat for forge_createPlan. */
  renderPlan?: (props: {
    status: string;
    args: Record<string, unknown>;
    result?: { success: boolean; message: string; data?: unknown };
  }) => ReactNode;
}

/**
 * Factory: produce all CopilotKit action configs for the forge domain.
 *
 * All action names are prefixed with `forge_` to prevent collisions
 * when multiple domains register simultaneously.
 */
export function createForgeActions(deps: ForgeActionsDeps): CopilotActionConfig[] {
  const {
    getGraph,
    applyOperations,
    onAIHighlight,
    openOverlay,
    revealSelection,
    createNodeOverlayId,
    createPlanApi,
    setPendingFromPlan,
    commitGraph,
    renderPlan,
  } = deps;

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

    // -----------------------------------------------------------------------
    // forge_createPlan
    // -----------------------------------------------------------------------
    {
      name: 'forge_createPlan',
      description:
        'Create a plan (list of graph operations) for a goal without applying them. Use when the user wants to preview or review changes before executing. Call forge_executePlan with the returned steps to apply.',
      parameters: [
        { name: 'goal', type: 'string' as const, description: 'What to achieve (e.g. "Add 3 character nodes and connect them")', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        if (!createPlanApi) {
          return { success: false, message: 'Plan API not configured.' };
        }
        const graph = getGraph();
        const graphSummary = graph
          ? {
              title: graph.title,
              nodeCount: graph.flow.nodes.length,
              nodes: graph.flow.nodes.map((n) => ({ id: n.id, type: n.data?.type, label: n.data?.label })),
              edges: graph.flow.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
            }
          : {};
        try {
          const { steps } = await createPlanApi(String(args.goal ?? ''), graphSummary);
          return { success: true, message: `Plan with ${Array.isArray(steps) ? steps.length : 0} steps.`, data: { steps: steps ?? [] } };
        } catch (err) {
          return { success: false, message: err instanceof Error ? err.message : 'Plan failed.', data: { steps: [] } };
        }
      },
      render: renderPlan,
    },

    // -----------------------------------------------------------------------
    // forge_executePlan
    // -----------------------------------------------------------------------
    {
      name: 'forge_executePlan',
      description:
        'Execute a plan (list of steps from forge_createPlan). Applies each operation to the graph and highlights changes. Use after forge_createPlan when the user approves.',
      parameters: [
        {
          name: 'steps',
          type: 'object' as const,
          description: 'Array of plan steps (from forge_createPlan result). Each has type and args.',
          required: true,
        },
      ],
      handler: async (args: Record<string, unknown>) => {
        const raw = args.steps ?? (args as { data?: { steps?: unknown[] } }).data?.steps ?? args;
        const steps = Array.isArray(raw) ? raw : [];
        const graph = getGraph();
        if (!graph) return { success: false, message: 'No active graph.' };
        const nodeIds: string[] = [];
        const edgeIds: string[] = [];
        for (const step of steps) {
          const op = planStepToOp(typeof step === 'object' && step !== null ? (step as Record<string, unknown>) : {});
          if (!op) continue;
          applyOperations([op]);
          if (op.type === 'createNode' && op.id) nodeIds.push(op.id);
          if (op.type === 'updateNode') nodeIds.push(op.nodeId);
          if (op.type === 'createEdge') {
            const g2 = getGraph();
            const edge = g2?.flow.edges.find((e) => e.source === op.source && e.target === op.target);
            if (edge) edgeIds.push(edge.id);
          }
        }
        if (nodeIds.length || edgeIds.length) {
          onAIHighlight({
            entities: {
              ...(nodeIds.length ? { 'forge.node': nodeIds } : {}),
              ...(edgeIds.length ? { 'forge.edge': edgeIds } : {}),
            },
          });
        }
        setPendingFromPlan?.(true);
        return { success: true, message: `Executed ${steps.length} steps.`, data: { stepCount: steps.length } };
      },
    },

    // -----------------------------------------------------------------------
    // forge_commit
    // -----------------------------------------------------------------------
    {
      name: 'forge_commit',
      description: 'Save the current graph to the server (persist draft). Use after reviewing changes.',
      parameters: [],
      handler: async () => {
        if (!commitGraph) {
          return { success: false, message: 'Commit not available.' };
        }
        try {
          await commitGraph();
          setPendingFromPlan?.(false);
          return { success: true, message: 'Graph saved.' };
        } catch (err) {
          return { success: false, message: err instanceof Error ? err.message : 'Save failed.' };
        }
      },
    },
  ];
}


import type { DomainTool, DomainToolContext } from '@forge/shared/assistant';
import type { ForgeGraphDoc, ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';
import { FORGE_NODE_TYPE } from '@forge/types/graph';

export interface ForgeAssistantToolsDeps {
  getGraph: () => ForgeGraphDoc | null;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
  onAIHighlight: (entities: Record<string, string[]>) => void;
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
  openOverlay?: (id: string, payload?: Record<string, unknown>) => void;
  revealSelection?: () => void;
  createNodeOverlayId?: string;
}

function copilotParamsToJsonSchema(
  params: Array<{ name: string; type: string; description?: string; required?: boolean }>
): { type: 'object'; properties: Record<string, unknown>; required?: string[] } {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const p of params) {
    properties[p.name] = { type: p.type, description: p.description };
    if (p.required) required.push(p.name);
  }
  return { type: 'object', properties, required: required.length > 0 ? required : undefined };
}

/**
 * Create the first 2 Forge tools: forge_getGraph, forge_createNode.
 * Used by useForgeAssistantContract.
 */
export function createForgeAssistantTools(deps: ForgeAssistantToolsDeps): DomainTool[] {
  const {
    getGraph,
    applyOperations,
    onAIHighlight,
    createPlanApi,
    createStoryBuilderApi,
    openOverlay,
    revealSelection,
    createNodeOverlayId,
  } = deps;

  const tools: DomainTool[] = [
    {
      domain: 'forge',
      name: 'forge_getGraph',
      description:
        'Get the current graph state including every node id and edge. Call this before createEdge to get source and target node ids.',
      parameters: copilotParamsToJsonSchema([]),
      execute: async (_args, _context: DomainToolContext) => {
        const graph = getGraph();
        if (!graph)
          return { success: false, message: 'No active graph' };

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
    {
      domain: 'forge',
      name: 'forge_createNode',
      description:
        'Create a new node in the dialogue graph. Use this when the user wants to add a character dialogue, player choice, or conditional logic node.',
      parameters: copilotParamsToJsonSchema([
        {
          name: 'nodeType',
          type: 'string',
          description: `The type of node to create. Must be one of: ${Object.values(FORGE_NODE_TYPE).join(', ')}`,
          required: true,
        },
        { name: 'label', type: 'string', description: 'A label for the node', required: true },
        { name: 'content', type: 'string', description: 'The dialogue content or text', required: false },
        { name: 'speaker', type: 'string', description: 'The speaker name for dialogue nodes', required: false },
        { name: 'x', type: 'number', description: 'X position', required: false },
        { name: 'y', type: 'number', description: 'Y position', required: false },
      ]),
      execute: async (args: unknown, _context: DomainToolContext) => {
        const a = args as Record<string, unknown>;
        const { nodeType, label, content, speaker, x, y } = a;
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
    },
    {
      domain: 'forge',
      name: 'forge_createPlan',
      description:
        'Create a plan (list of graph operations) for a goal without applying them. Use when the user wants to preview or review changes before executing. Call executePlan with the returned steps to apply.',
      parameters: copilotParamsToJsonSchema([
        { name: 'goal', type: 'string', description: 'What to achieve (e.g. "Add 3 character nodes and connect them")', required: true },
      ]),
      execute: async (args: unknown, _context: DomainToolContext) => {
        if (!createPlanApi) {
          return { success: false, message: 'Plan API not configured.' };
        }
        const a = args as Record<string, unknown>;
        const goal = String(a.goal ?? '');
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
          const { steps } = await createPlanApi(goal, graphSummary);
          return {
            success: true,
            message: `Plan with ${Array.isArray(steps) ? steps.length : 0} steps.`,
            data: { steps: steps ?? [], goal },
          };
        } catch (err) {
          return {
            success: false,
            message: err instanceof Error ? err.message : 'Plan failed.',
            data: { steps: [], goal },
          };
        }
      },
    },
    {
      domain: 'forge',
      name: 'forge_createStoryFromPremise',
      description:
        'Create a story scaffold from a premise. Returns structured createNode/createEdge steps, character ideas, and scene summaries.',
      parameters: copilotParamsToJsonSchema([
        { name: 'premise', type: 'string', description: 'Story premise or concept', required: true },
        {
          name: 'characterCount',
          type: 'number',
          description: 'Optional number of characters to generate (default 3).',
          required: false,
        },
        {
          name: 'sceneCount',
          type: 'number',
          description: 'Optional number of scenes to generate (default 5).',
          required: false,
        },
      ]),
      execute: async (args: unknown) => {
        if (!createStoryBuilderApi) {
          return { success: false, message: 'Story builder API not configured.' };
        }

        const a = args as Record<string, unknown>;
        const premise = String(a.premise ?? '').trim();
        if (!premise) {
          return { success: false, message: 'premise is required.' };
        }

        try {
          const result = await createStoryBuilderApi(premise, {
            characterCount: typeof a.characterCount === 'number' ? a.characterCount : undefined,
            sceneCount: typeof a.sceneCount === 'number' ? a.sceneCount : undefined,
          });

          return {
            success: true,
            message: result.summary,
            data: {
              steps: result.steps ?? [],
              characters: result.characters ?? [],
              scenes: result.scenes ?? [],
              summary: result.summary,
            },
          };
        } catch (err) {
          return {
            success: false,
            message: err instanceof Error ? err.message : 'Story builder failed.',
            data: { steps: [], characters: [], scenes: [], summary: '' },
          };
        }
      },
    },
    {
      domain: 'forge',
      name: 'forge_updateNode',
      description:
        'Update properties of an existing node. Use this when the user wants to change node content, label, or other properties.',
      parameters: copilotParamsToJsonSchema([
        { name: 'nodeId', type: 'string', description: 'The ID of the node to update', required: true },
        { name: 'label', type: 'string', description: 'New label', required: false },
        { name: 'content', type: 'string', description: 'New content', required: false },
        { name: 'speaker', type: 'string', description: 'New speaker name', required: false },
      ]),
      execute: async (args: unknown, _context: DomainToolContext) => {
        const a = args as Record<string, unknown>;
        const { nodeId, label, content, speaker } = a;
        const updates: Record<string, unknown> = {};
        if (label !== undefined) updates.label = label;
        if (content !== undefined) updates.content = content;
        if (speaker !== undefined) updates.speaker = speaker;
        applyOperations([{ type: 'updateNode', nodeId: nodeId as string, updates }]);
        onAIHighlight({ entities: { 'forge.node': [nodeId as string] } });
        return { success: true, message: `Updated node ${String(nodeId)}` };
      },
    },
    {
      domain: 'forge',
      name: 'forge_deleteNode',
      description: 'Delete a node from the graph. This also removes connected edges.',
      parameters: copilotParamsToJsonSchema([
        { name: 'nodeId', type: 'string', description: 'The ID of the node to delete', required: true },
      ]),
      execute: async (args: unknown, _context: DomainToolContext) => {
        const a = args as Record<string, unknown>;
        const { nodeId } = a;
        applyOperations([{ type: 'deleteNode', nodeId: nodeId as string }]);
        return { success: true, message: `Deleted node ${String(nodeId)}` };
      },
    },
    {
      domain: 'forge',
      name: 'forge_createEdge',
      description:
        'Create a connection between two nodes. Call getGraph to get node ids, or use nodeId from createNode response.',
      parameters: copilotParamsToJsonSchema([
        { name: 'sourceNodeId', type: 'string', description: 'Source node id', required: true },
        { name: 'targetNodeId', type: 'string', description: 'Target node id', required: true },
      ]),
      execute: async (args: unknown, _context: DomainToolContext) => {
        const a = args as Record<string, unknown>;
        const { sourceNodeId, targetNodeId } = a;
        applyOperations([
          { type: 'createEdge', source: sourceNodeId as string, target: targetNodeId as string },
        ]);
        const graphAfter = getGraph();
        const newEdge = graphAfter?.flow.edges.find(
          (e) => e.source === sourceNodeId && e.target === targetNodeId
        );
        if (newEdge) onAIHighlight({ entities: { 'forge.edge': [newEdge.id] } });
        return { success: true, message: `Connected ${String(sourceNodeId)} to ${String(targetNodeId)}` };
      },
    },
    {
      domain: 'forge',
      name: 'forge_revealSelection',
      description:
        'Fit the viewport to the current selection (selected node or edge), or fit all nodes if nothing is selected.',
      parameters: copilotParamsToJsonSchema([]),
      execute: async () => {
        revealSelection?.();
        return { success: true, message: 'Viewport fitted to selection.' };
      },
    },
    {
      domain: 'forge',
      name: 'forge_openCreateNodeModal',
      description:
        'Open the "Create node" overlay so the user can add a new node via the form. Optionally pre-fill fields.',
      parameters: copilotParamsToJsonSchema([
        { name: 'nodeType', type: 'string', description: 'One of: CHARACTER, PLAYER, CONDITIONAL', required: false },
        { name: 'label', type: 'string', description: 'Pre-fill label', required: false },
        { name: 'content', type: 'string', description: 'Pre-fill content', required: false },
        { name: 'speaker', type: 'string', description: 'Pre-fill speaker', required: false },
      ]),
      execute: async (args: unknown) => {
        if (!openOverlay || !createNodeOverlayId) {
          return { success: false, message: 'Create node overlay not available.' };
        }
        const a = args as Record<string, unknown>;
        openOverlay(createNodeOverlayId, {
          nodeType: a.nodeType,
          label: a.label,
          content: a.content,
          speaker: a.speaker,
        });
        return { success: true, message: 'Opened Create node overlay.' };
      },
    },
  ];

  return tools;
}

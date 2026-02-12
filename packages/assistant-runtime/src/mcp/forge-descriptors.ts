import { buildMcpAppDescriptor, type DomainToolLike } from './domain-tool-to-mcp';
import type { McpAppDescriptor, McpToolDescriptor } from './types';

const FORGE_TOOLS: DomainToolLike[] = [
  {
    domain: 'forge',
    name: 'forge_getGraph',
    description: 'Return active dialogue graph summary including nodes and edges.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    domain: 'forge',
    name: 'forge_createNode',
    description: 'Create a node in the active graph.',
    parameters: {
      type: 'object',
      properties: {
        nodeType: { type: 'string' },
        label: { type: 'string' },
        content: { type: 'string' },
        speaker: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
      },
      required: ['nodeType', 'label'],
    },
  },
  {
    domain: 'forge',
    name: 'forge_updateNode',
    description: 'Update node fields by nodeId.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
        label: { type: 'string' },
        content: { type: 'string' },
        speaker: { type: 'string' },
      },
      required: ['nodeId'],
    },
  },
  {
    domain: 'forge',
    name: 'forge_deleteNode',
    description: 'Delete node by nodeId.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string' },
      },
      required: ['nodeId'],
    },
  },
  {
    domain: 'forge',
    name: 'forge_createEdge',
    description: 'Create graph edge between two node IDs.',
    parameters: {
      type: 'object',
      properties: {
        sourceNodeId: { type: 'string' },
        targetNodeId: { type: 'string' },
      },
      required: ['sourceNodeId', 'targetNodeId'],
    },
  },
  {
    domain: 'forge',
    name: 'forge_createPlan',
    description: 'Generate a multi-step graph plan without applying mutations.',
    parameters: {
      type: 'object',
      properties: {
        goal: { type: 'string' },
      },
      required: ['goal'],
    },
  },
  {
    domain: 'forge',
    name: 'forge_createStoryFromPremise',
    description: 'Generate story scaffold steps, character ideas, and scenes from premise.',
    parameters: {
      type: 'object',
      properties: {
        premise: { type: 'string' },
        characterCount: { type: 'number' },
        sceneCount: { type: 'number' },
      },
      required: ['premise'],
    },
  },
  {
    domain: 'forge',
    name: 'forge_revealSelection',
    description: 'Fit viewport to current selection or full graph.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    domain: 'forge',
    name: 'forge_openCreateNodeModal',
    description: 'Open create-node modal with optional prefilled values.',
    parameters: {
      type: 'object',
      properties: {
        nodeType: { type: 'string' },
        label: { type: 'string' },
        content: { type: 'string' },
        speaker: { type: 'string' },
      },
    },
  },
];

export function createForgeToolDescriptors(): McpToolDescriptor[] {
  return buildMcpAppDescriptor({
    id: 'forge',
    name: 'Forge',
    description: 'Forge editor assistant tool descriptors (metadata-only).',
    tools: FORGE_TOOLS,
  }).tools;
}

export function createForgeMcpAppDescriptor(): McpAppDescriptor {
  return buildMcpAppDescriptor({
    id: 'forge',
    name: 'Forge Assistant',
    description:
      'Forge MCP app descriptor emitted from assistant tool contracts (server process deferred).',
    tools: FORGE_TOOLS,
    metadata: {
      phase: 'adapter-only',
      executableServer: false,
    },
  });
}

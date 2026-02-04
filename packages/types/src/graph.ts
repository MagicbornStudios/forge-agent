import type { Node, Edge } from 'reactflow';
import type { ForgeGraphRecord } from './payload';

export const FORGE_NODE_TYPE = {
  CHARACTER: 'CHARACTER',
  PLAYER: 'PLAYER',
  CONDITIONAL: 'CONDITIONAL',
} as const;

export type ForgeNodeType = typeof FORGE_NODE_TYPE[keyof typeof FORGE_NODE_TYPE];

export type ForgeNode = {
  id: string;
  type: ForgeNodeType;
  label?: string;
  speaker?: string;
  content?: string;
  choices?: Array<{
    id: string;
    text: string;
    nextNodeId?: string;
  }>;
};

export type ForgeReactFlowNode = Node & {
  data: ForgeNode;
};

export type ForgeReactFlowEdge = Edge;

export type ForgeReactFlowJson = {
  nodes: ForgeReactFlowNode[];
  edges: ForgeReactFlowEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
};

export type ForgeGraphDoc = Omit<ForgeGraphRecord, 'flow'> & {
  flow: ForgeReactFlowJson;
};

// Patch operations for AI agent
export const FORGE_GRAPH_PATCH_OP = {
  CREATE_NODE: 'createNode',
  DELETE_NODE: 'deleteNode',
  UPDATE_NODE: 'updateNode',
  MOVE_NODE: 'moveNode',
  CREATE_EDGE: 'createEdge',
  DELETE_EDGE: 'deleteEdge',
} as const;

export type ForgeGraphPatchOp =
  | { type: 'createNode'; nodeType: ForgeNodeType; position: { x: number; y: number }; data?: Partial<ForgeNode>; id?: string }
  | { type: 'deleteNode'; nodeId: string }
  | { type: 'updateNode'; nodeId: string; updates: Partial<ForgeNode> }
  | { type: 'moveNode'; nodeId: string; position: { x: number; y: number } }
  | { type: 'createEdge'; source: string; target: string; sourceHandle?: string; targetHandle?: string }
  | { type: 'deleteEdge'; edgeId: string };


import type { Node, Edge } from 'reactflow';
import type { ForgeGraphRecord } from './payload';

export const FORGE_NODE_TYPE = {
  CHARACTER: 'CHARACTER',
  PLAYER: 'PLAYER',
  CONDITIONAL: 'CONDITIONAL',
  PAGE: 'PAGE',
  STORYLET: 'STORYLET',
  DETOUR: 'DETOUR',
  JUMP: 'JUMP',
  END: 'END',
} as const;

export type PageType = 'ACT' | 'CHAPTER' | 'PAGE';

export type ForgeNodeType = typeof FORGE_NODE_TYPE[keyof typeof FORGE_NODE_TYPE];

export const FORGE_GRAPH_KIND = {
  NARRATIVE: 'NARRATIVE',
  STORYLET: 'STORYLET',
} as const;

export type ForgeGraphKind = typeof FORGE_GRAPH_KIND[keyof typeof FORGE_GRAPH_KIND];

export const FORGE_EDGE_KIND = {
  FLOW: 'FLOW',
  CHOICE: 'CHOICE',
  CONDITION: 'CONDITION',
  DEFAULT: 'DEFAULT',
  VISUAL: 'VISUAL',
} as const;

export type ForgeEdgeKind = typeof FORGE_EDGE_KIND[keyof typeof FORGE_EDGE_KIND];

export const FORGE_CONDITIONAL_BLOCK_TYPE = {
  IF: 'if',
  ELSE_IF: 'elseif',
  ELSE: 'else',
} as const;

export type ForgeConditionalBlockType =
  typeof FORGE_CONDITIONAL_BLOCK_TYPE[keyof typeof FORGE_CONDITIONAL_BLOCK_TYPE];

export const FORGE_STORYLET_CALL_MODE = {
  DETOUR_RETURN: 'DETOUR_RETURN',
  JUMP: 'JUMP',
} as const;

export type ForgeStoryletCallMode =
  typeof FORGE_STORYLET_CALL_MODE[keyof typeof FORGE_STORYLET_CALL_MODE];

/** Condition operators for Yarn/export compatibility */
export const CONDITION_OPERATOR = {
  IS_SET: 'is_set',
  IS_NOT_SET: 'is_not_set',
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  GREATER_EQUAL: 'greater_equal',
  LESS_EQUAL: 'less_equal',
} as const;

export const CONDITION_OPERATOR_SYMBOLS = {
  EQUALS: '==',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_EQUAL: '>=',
  LESS_EQUAL: '<=',
  AND: 'and',
  NOT: 'not',
} as const;

/** Condition for evaluating flags/variables */
export interface ForgeCondition {
  flag: string;
  operator: (typeof CONDITION_OPERATOR)[keyof typeof CONDITION_OPERATOR];
  value?: boolean | number | string;
}

/** Choice with optional conditions and setFlags */
export type ForgeChoice = {
  id: string;
  text: string;
  nextNodeId?: string;
  conditions?: ForgeCondition[];
  setFlags?: string[];
};

/** Conditional content block (if/elseif/else) */
export type ForgeConditionalBlock = {
  id: string;
  type: ForgeConditionalBlockType;
  condition?: ForgeCondition[];
  speaker?: string;
  characterId?: string;
  content?: string;
  nextNodeId?: string;
  setFlags?: string[];
};

/** Storylet/detour call to another graph */
export type ForgeStoryletCall = {
  mode: ForgeStoryletCallMode;
  targetGraphId: number;
  targetStartNodeId?: string;
  returnNodeId?: string;
  returnGraphId?: number;
};

/** Presentation/media references */
export type ForgeNodePresentation = {
  imageId?: string;
  backgroundId?: string;
  portraitId?: string;
};

/** Runtime directive placeholder (for future scene/media/camera) */
export type ForgeRuntimeDirective = {
  type: string;
  refId?: string;
  payload?: Record<string, unknown>;
};

export type ForgeNode = {
  id: string;
  type: ForgeNodeType;
  label?: string;
  speaker?: string;
  characterId?: string;
  content?: string;
  /** When type === 'PAGE', the structural level (Act, Chapter, Page). */
  pageType?: PageType;
  choices?: ForgeChoice[];
  /** For CONDITIONAL and CHARACTER nodes */
  conditionalBlocks?: ForgeConditionalBlock[];
  /** For STORYLET and DETOUR nodes */
  storyletCall?: ForgeStoryletCall;
  setFlags?: string[];
  defaultNextNodeId?: string;
  presentation?: ForgeNodePresentation;
  runtimeDirectives?: ForgeRuntimeDirective[];
  actId?: number;
  chapterId?: number;
  pageId?: number;
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
  /** Start node id for export; derived from flow when absent */
  startNodeId?: string;
  /** End node ids for export; derived from flow when absent */
  endNodeIds?: Array<{ nodeId: string; exitKey?: string }>;
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


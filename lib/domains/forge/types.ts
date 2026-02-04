/**
 * Forge domain types -- re-exported from the canonical location.
 * Import from here for domain-local use; external consumers can
 * continue importing from `@/types/graph`.
 */
export type {
  ForgeNode,
  ForgeNodeType,
  ForgeGraphDoc,
  ForgeGraphPatchOp,
  ForgeReactFlowNode,
  ForgeReactFlowEdge,
  ForgeReactFlowJson,
} from '@/types/graph';

export { FORGE_NODE_TYPE, FORGE_GRAPH_PATCH_OP } from '@/types/graph';

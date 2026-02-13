/**
 * Runtime Export - prepares graph for Yarn export, strips runtime-only nodes
 */
import type {
  ForgeGraphDoc,
  ForgeReactFlowEdge,
  ForgeReactFlowNode,
  ForgeNodeType,
  ForgeNode,
} from '@forge/types';
import { FORGE_NODE_TYPE } from '@forge/types';

/** Node types that are not exported to Yarn (runtime-only structure) */
function isRuntimeOnlyNodeType(nodeType: ForgeNodeType): boolean {
  return nodeType === FORGE_NODE_TYPE.JUMP || nodeType === FORGE_NODE_TYPE.END;
}

export type RuntimeExportDiagnostics = {
  ignoredRuntimeNodes: Array<{ id: string; type: ForgeNodeType }>;
  removedEdges: Array<{ id?: string; source: string; target: string }>;
  inlineRuntimeChains: Array<{ from: string; to: string; via: string[] }>;
};

export type PreparedYarnExportGraph = {
  nodes: ForgeReactFlowNode[];
  edges: ForgeReactFlowEdge[];
  runtimeNodeIds: Set<string>;
  diagnostics: RuntimeExportDiagnostics;
};

function sanitizeRuntimeLinks(
  node: ForgeReactFlowNode,
  runtimeNodeIds: Set<string>
): ForgeReactFlowNode {
  if (!node.data) return node;
  const data = { ...node.data } as ForgeNode;
  data.runtimeDirectives = undefined;
  data.presentation = undefined;
  if (data.defaultNextNodeId && runtimeNodeIds.has(data.defaultNextNodeId)) {
    data.defaultNextNodeId = undefined;
  }
  if (data.choices) {
    data.choices = data.choices.map((c) =>
      c.nextNodeId && runtimeNodeIds.has(c.nextNodeId) ? { ...c, nextNodeId: undefined } : c
    );
  }
  if (data.conditionalBlocks) {
    data.conditionalBlocks = data.conditionalBlocks.map((b) =>
      b.nextNodeId && runtimeNodeIds.has(b.nextNodeId) ? { ...b, nextNodeId: undefined } : b
    );
  }
  return { ...node, data };
}

function buildEdgeLookup(edges: ForgeReactFlowEdge[]): Map<string, string[]> {
  const lookup = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!e.source || !e.target) return;
    const existing = lookup.get(e.source);
    if (existing) existing.push(e.target);
    else lookup.set(e.source, [e.target]);
  });
  return lookup;
}

function findInlineRuntimeChains(
  edges: ForgeReactFlowEdge[],
  runtimeNodeIds: Set<string>,
  yarnNodeIds: Set<string>
): Array<{ from: string; to: string; via: string[] }> {
  const chains: Array<{ from: string; to: string; via: string[] }> = [];
  const edgeLookup = buildEdgeLookup(edges);
  const chainKeys = new Set<string>();

  yarnNodeIds.forEach((startId) => {
    const nextIds = edgeLookup.get(startId) ?? [];
    nextIds.forEach((nextId) => {
      if (!runtimeNodeIds.has(nextId)) return;
      const queue: Array<{ current: string; path: string[] }> = [{ current: nextId, path: [nextId] }];
      const visited = new Set<string>([nextId]);
      while (queue.length) {
        const { current, path } = queue.shift()!;
        const targets = edgeLookup.get(current) ?? [];
        targets.forEach((targetId) => {
          if (runtimeNodeIds.has(targetId)) {
            if (!visited.has(targetId)) {
              visited.add(targetId);
              queue.push({ current: targetId, path: [...path, targetId] });
            }
            return;
          }
          if (yarnNodeIds.has(targetId)) {
            const key = `${startId}->${targetId}:${path.join(',')}`;
            if (!chainKeys.has(key)) {
              chainKeys.add(key);
              chains.push({ from: startId, to: targetId, via: path });
            }
          }
        });
      }
    });
  });
  return chains;
}

/** Derive startNodeId from flow when absent */
function deriveStartNodeId(graph: ForgeGraphDoc): string | undefined {
  if (graph.startNodeId) return graph.startNodeId;
  const nodes = graph.flow?.nodes;
  if (!nodes?.length) return undefined;
  const edgeTargets = new Set((graph.flow?.edges ?? []).map((e) => e.target));
  const sources = nodes.filter((n) => !edgeTargets.has(n.id));
  return sources[0]?.id ?? nodes[0]?.id;
}

/** Derive endNodeIds from flow when absent */
function deriveEndNodeIds(graph: ForgeGraphDoc): Array<{ nodeId: string; exitKey?: string }> {
  if (graph.endNodeIds && graph.endNodeIds.length > 0) return graph.endNodeIds;
  const nodes = graph.flow?.nodes ?? [];
  const edges = graph.flow?.edges ?? [];
  const outgoing = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!e.source || !e.target) return;
    const arr = outgoing.get(e.source) ?? [];
    arr.push(e.target);
    outgoing.set(e.source, arr);
  });
  const ends: Array<{ nodeId: string; exitKey?: string }> = [];
  nodes.forEach((n) => {
    if (!outgoing.has(n.id)) ends.push({ nodeId: n.id });
  });
  return ends;
}

export function prepareGraphForYarnExport(graph: ForgeGraphDoc): PreparedYarnExportGraph {
  const ignoredRuntimeNodes: Array<{ id: string; type: ForgeNodeType }> = [];
  const runtimeNodeIds = new Set<string>();
  const yarnNodeIds = new Set<string>();

  (graph.flow?.nodes ?? []).forEach((node) => {
    if (!node.id || !node.data?.type) return;
    if (isRuntimeOnlyNodeType(node.data.type)) {
      runtimeNodeIds.add(node.id);
      ignoredRuntimeNodes.push({ id: node.id, type: node.data.type });
    } else {
      yarnNodeIds.add(node.id);
    }
  });

  const removedEdges: Array<{ id?: string; source: string; target: string }> = [];
  const filteredEdges = (graph.flow?.edges ?? []).filter((edge) => {
    if (!edge.source || !edge.target) return false;
    if (runtimeNodeIds.has(edge.source) || runtimeNodeIds.has(edge.target)) {
      removedEdges.push({ id: edge.id, source: edge.source, target: edge.target });
      return false;
    }
    return true;
  });

  const filteredNodes = (graph.flow?.nodes ?? [])
    .filter((node) => {
      if (!node.data?.type) return true;
      return !isRuntimeOnlyNodeType(node.data.type);
    })
    .map((node) => sanitizeRuntimeLinks(node, runtimeNodeIds));

  const inlineRuntimeChains = findInlineRuntimeChains(
    graph.flow?.edges ?? [],
    runtimeNodeIds,
    yarnNodeIds
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    runtimeNodeIds,
    diagnostics: { ignoredRuntimeNodes, removedEdges, inlineRuntimeChains },
  };
}

export function logRuntimeExportDiagnostics(
  graph: ForgeGraphDoc,
  diagnostics: RuntimeExportDiagnostics
): void {
  if (diagnostics.ignoredRuntimeNodes.length > 0) {
    const list = diagnostics.ignoredRuntimeNodes.map((n) => `${n.id}:${n.type}`).join(', ');
    console.debug(`[Yarn Export] Ignored runtime-only nodes in graph ${graph.id} (${graph.title}): ${list}`);
  }
  if (diagnostics.inlineRuntimeChains.length > 0) {
    const list = diagnostics.inlineRuntimeChains
      .map((c) => `${c.from} -> ${c.via.join(' -> ')} -> ${c.to}`)
      .join('; ');
    console.warn(`[Yarn Export] Runtime-only chains in graph ${graph.id} (${graph.title}): ${list}`);
  }
}

/** Augment graph with derived startNodeId/endNodeIds when absent */
export function ensureGraphExportFields(graph: ForgeGraphDoc): ForgeGraphDoc {
  const startNodeId = graph.startNodeId ?? deriveStartNodeId(graph);
  const endNodeIds = graph.endNodeIds ?? deriveEndNodeIds(graph);
  return { ...graph, startNodeId, endNodeIds };
}

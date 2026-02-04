import type { ForgeGraphDoc } from '@forge/types/graph';

export interface GraphSequenceResult {
  /** Node ids in a linear order (e.g. topological). */
  orderedNodeIds: string[];
  /** Optional: one track per branch; each track is an array of node ids in order. */
  tracks?: string[][];
}

/**
 * Derives a linear order of node ids from the graph (topological sort).
 * Nodes with no incoming edges come first; then nodes in dependency order.
 * If the graph has cycles, falls back to document order (flow.nodes).
 */
export function graphToSequence(graph: ForgeGraphDoc | null): GraphSequenceResult {
  if (!graph || !graph.flow.nodes.length) {
    return { orderedNodeIds: [] };
  }

  const { nodes, edges } = graph.flow;
  const idToIndex = new Map<string, number>();
  nodes.forEach((n, i) => idToIndex.set(n.id, i));

  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });
  edges.forEach((e) => {
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    outEdges.get(e.source)?.push(e.target);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const orderedNodeIds: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    orderedNodeIds.push(u);
    for (const v of outEdges.get(u) ?? []) {
      const d = inDegree.get(v)! - 1;
      inDegree.set(v, d);
      if (d === 0) queue.push(v);
    }
  }

  if (orderedNodeIds.length < nodes.length) {
    const inOrder = new Set(orderedNodeIds);
    const rest = nodes.map((n) => n.id).filter((id) => !inOrder.has(id));
    orderedNodeIds.push(...rest);
  }

  return { orderedNodeIds };
}


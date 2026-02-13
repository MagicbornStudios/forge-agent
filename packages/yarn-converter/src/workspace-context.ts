/**
 * Graph resolution context for Yarn export
 * forge-agent: no ForgeWorkspaceStore; use Payload fetcher for server-side full export
 */
import type { ForgeGraphDoc } from '@forge/types';
import type { YarnConverterContext } from './types';

export type PayloadGraphFetcher = (graphId: number) => Promise<ForgeGraphDoc>;

/**
 * Create context for server-side full Yarn export.
 * Uses Payload to load referenced graphs (storylet/detour).
 */
export function createPayloadGraphContext(fetchGraph: PayloadGraphFetcher): YarnConverterContext {
  const visitedGraphs = new Set<number>();
  const cache = new Map<number, ForgeGraphDoc>();

  return {
    getGraphFromCache: (graphId: string | number) => {
      const id = typeof graphId === 'string' ? parseInt(graphId, 10) : graphId;
      return cache.get(id);
    },
    ensureGraph: async (graphId: number) => {
      const cached = cache.get(graphId);
      if (cached) return cached;
      const graph = await fetchGraph(graphId);
      cache.set(graphId, graph);
      return graph;
    },
    visitedGraphs,
  };
}

/**
 * Minimal context - no graph resolution.
 * Use for preview (current graph only) when storylet/detour not needed.
 */
export function createMinimalContext(): YarnConverterContext {
  return {
    visitedGraphs: new Set<number>(),
  };
}

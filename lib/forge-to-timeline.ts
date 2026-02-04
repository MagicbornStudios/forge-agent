import type { ForgeGraphDoc } from '@/types/graph';
import { graphToSequence } from '@/lib/graph-to-sequence';

/**
 * Minimal timeline element shape compatible with timeline UIs (e.g. Twick).
 * Time is in abstract units (e.g. 1 unit per node); can be scaled for real time.
 */
export interface TimelineElement {
  id: string;
  start: number;
  end: number;
  label: string;
  /** Domain id for sync (e.g. Forge node id). */
  meta?: { nodeId: string; type?: string };
}

export interface TimelineTrack {
  id: string;
  elements: TimelineElement[];
}

export interface ForgeTimelineModel {
  tracks: TimelineTrack[];
}

const DEFAULT_DURATION = 1;

/**
 * Maps a Forge graph to a timeline model (tracks + elements with start/end).
 * Each node becomes one element; order is topological. One track for the main sequence.
 * Use this to feed Twick's timeline or any track-based timeline component.
 */
export function forgeGraphToTimelineModel(graph: ForgeGraphDoc | null): ForgeTimelineModel {
  if (!graph || !graph.flow.nodes.length) {
    return { tracks: [] };
  }

  const { orderedNodeIds } = graphToSequence(graph);
  const nodeMap = new Map(graph.flow.nodes.map((n) => [n.id, n]));

  let time = 0;
  const elements: TimelineElement[] = orderedNodeIds.map((nodeId) => {
    const node = nodeMap.get(nodeId);
    const label = node?.data?.label ?? nodeId;
    const start = time;
    const duration = DEFAULT_DURATION;
    time += duration;
    return {
      id: `el-${nodeId}`,
      start,
      end: start + duration,
      label,
      meta: { nodeId, type: node?.data?.type },
    };
  });

  return {
    tracks: [{ id: 'main', elements }],
  };
}

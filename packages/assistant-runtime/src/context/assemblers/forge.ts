export interface ForgeGraphSummary {
  id: number;
  kind: string;
  title: string;
  nodeCount: number;
  edgeCount: number;
  sampleNodeLabels: string[];
}

export interface ForgeContextSnapshot {
  graphCount: number;
  graphs: ForgeGraphSummary[];
}

interface PayloadClient {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[] }>;
}

function getNodeLabels(flow: unknown): string[] {
  if (!flow || typeof flow !== 'object') return [];
  const nodes = (flow as { nodes?: unknown[] }).nodes;
  if (!Array.isArray(nodes)) return [];

  return nodes
    .map((node) => {
      if (!node || typeof node !== 'object') return null;
      const data = (node as { data?: Record<string, unknown> }).data;
      const label = typeof data?.label === 'string' ? data.label : null;
      return label;
    })
    .filter((label): label is string => Boolean(label))
    .slice(0, 8);
}

function countArray(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export async function assembleForgeContext(input: {
  payload: PayloadClient;
  projectId: number;
}): Promise<ForgeContextSnapshot> {
  const result = await input.payload.find({
    collection: 'forge-graphs',
    where: {
      project: { equals: input.projectId },
    },
    limit: 5,
    depth: 0,
    overrideAccess: true,
  });

  const graphs = result.docs.map((doc) => {
    const payloadDoc = (doc && typeof doc === 'object' ? doc : {}) as Record<string, unknown>;
    const flow = payloadDoc.flow as { nodes?: unknown[]; edges?: unknown[] } | undefined;
    return {
      id: typeof payloadDoc.id === 'number' ? payloadDoc.id : Number(payloadDoc.id ?? 0),
      kind: typeof payloadDoc.kind === 'string' ? payloadDoc.kind : 'UNKNOWN',
      title: typeof payloadDoc.title === 'string' ? payloadDoc.title : 'Untitled graph',
      nodeCount: countArray(flow?.nodes),
      edgeCount: countArray(flow?.edges),
      sampleNodeLabels: getNodeLabels(flow),
    };
  });

  return {
    graphCount: graphs.length,
    graphs,
  };
}

export function formatForgeContext(context: ForgeContextSnapshot): string {
  if (context.graphCount === 0) {
    return 'Forge context: no graphs found for this project.';
  }

  const lines = context.graphs.map((graph) => {
    const labels = graph.sampleNodeLabels.length > 0 ? ` labels: ${graph.sampleNodeLabels.join(', ')}` : '';
    return `- ${graph.title} (${graph.kind}): ${graph.nodeCount} nodes, ${graph.edgeCount} edges.${labels}`;
  });

  return ['Forge project context:', ...lines].join('\n');
}

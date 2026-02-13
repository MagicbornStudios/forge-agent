import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';
import { exportToYarn, createPayloadGraphContext } from '@forge/yarn-converter';
import type { ForgeGraphDoc } from '@forge/types';

/**
 * POST /api/forge/yarn-export
 * Full Yarn export with storylet/detour resolution (server-side).
 * Body: { graphId: number }
 */
export async function POST(request: NextRequest) {
  const payloadClient = await getPayload({ config: payloadConfig });
  const { user } = await payloadClient.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { graphId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const graphId = typeof body.graphId === 'number' ? body.graphId : undefined;
  if (graphId == null) {
    return NextResponse.json({ error: 'graphId (number) is required' }, { status: 400 });
  }

  const fetchGraph = async (id: number): Promise<ForgeGraphDoc> => {
    const doc = await payloadClient.findByID({
      collection: 'forge-graphs',
      id: String(id),
      depth: 0,
    });
    if (!doc || typeof doc !== 'object') {
      throw new Error(`Graph ${id} not found`);
    }
    const g = doc as { id: number; project: number; kind: string; title: string; flow: unknown };
    return {
      id: g.id,
      project: typeof g.project === 'object' ? (g.project as { id: number }).id : g.project,
      kind: g.kind as ForgeGraphDoc['kind'],
      title: g.title,
      flow: g.flow as ForgeGraphDoc['flow'],
      updatedAt: (doc as { updatedAt?: string }).updatedAt ?? '',
      createdAt: (doc as { createdAt?: string }).createdAt ?? '',
    } as ForgeGraphDoc;
  };

  const context = createPayloadGraphContext(fetchGraph);

  try {
    const rootGraph = await fetchGraph(graphId);
    const yarn = await exportToYarn(rootGraph, context);
    return NextResponse.json({ yarn });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

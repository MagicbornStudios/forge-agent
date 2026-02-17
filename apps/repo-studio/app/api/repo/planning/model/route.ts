import { NextResponse } from 'next/server';

import { loadPlanningStructuredModel } from '@/lib/planning/model';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;

  try {
    const model = await loadPlanningStructuredModel(loopId);
    return NextResponse.json(model);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      loopId: loopId || 'default',
      planningRoot: '.planning',
      docs: [],
      aggregate: {
        docCount: 0,
        planDocCount: 0,
        checklist: { total: 0, open: 0, closed: 0 },
        warningCount: 0,
      },
      message: String(error?.message || error || 'Unable to build planning model.'),
    }, { status: 500 });
  }
}

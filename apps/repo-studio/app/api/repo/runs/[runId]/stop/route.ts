import { NextResponse } from 'next/server';

import { serializeRun, stopRepoRun } from '@/lib/run-manager';

export async function POST(
  _request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  const params = await context.params;
  const runId = String(params.runId || '').trim();
  const result = stopRepoRun(runId);

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      message: result.message,
    }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    run: result.run ? serializeRun(result.run) : null,
  });
}

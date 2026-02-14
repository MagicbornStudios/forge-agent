import { NextResponse } from 'next/server';

import { runToolCommand } from '@/lib/tool-runner';

export async function POST(request: Request) {
  let body: { loopId?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const loopId = String(body.loopId || '').trim().toLowerCase();
  if (!loopId) {
    return NextResponse.json({ ok: false, message: 'loopId is required.' }, { status: 400 });
  }

  const result = runToolCommand('forge-loop', ['loop:use', loopId, '--json']);
  const payload = (() => {
    try {
      return JSON.parse(String(result.stdout || '{}'));
    } catch {
      return {};
    }
  })();
  return NextResponse.json({
    ok: payload.ok ?? result.ok === true,
    activeLoopId: payload.activeLoopId || loopId,
    planningRoot: payload.planningRoot || null,
    message: payload.message || payload.report || (result.ok ? 'Loop updated.' : 'Loop update failed.'),
    stderr: payload.stderr || result.stderr,
    attempts: result.attempts || [],
    resolvedAttempt: result.resolvedAttempt || null,
  }, { status: payload.ok === false || !result.ok ? 400 : 200 });
}

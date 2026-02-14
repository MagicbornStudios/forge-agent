import { NextResponse } from 'next/server';

import { ensureCodexSession } from '@/lib/codex-session';

export async function POST() {
  const result = await ensureCodexSession();
  const ok = result.ok === true;
  return NextResponse.json({
    ok,
    sessionId: result.sessionId || null,
    threadId: result.threadId || null,
    protocolInitialized: result.protocolInitialized === true,
    activeThreadCount: result.activeThreadCount || 0,
    activeTurnCount: result.activeTurnCount || 0,
    reused: result.reused === true,
    readiness: result.readiness || null,
    message: result.message || (ok ? 'Codex session started.' : 'Failed to start Codex session.'),
  }, { status: ok ? 200 : 503 });
}

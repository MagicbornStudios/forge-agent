import { NextResponse } from 'next/server';

import { getCodexSessionStatus } from '@/lib/codex-session';

export async function GET() {
  const status = await getCodexSessionStatus();
  return NextResponse.json({
    ok: status.ok,
    codex: {
      appServerReachable: status.running,
      protocolInitialized: status.protocolInitialized,
      activeThreadCount: status.activeThreadCount,
      activeTurnCount: status.activeTurnCount,
      execFallbackEnabled: status.execFallbackEnabled,
      transport: status.transport,
      threadId: status.threadId,
      sessionId: status.sessionId,
      diagnostics: status.diagnostics,
      readiness: status.readiness,
    },
    message: status.ok
      ? (status.running ? 'Codex app-server session is ready.' : 'Codex is ready. Session not started yet.')
      : 'Codex is not ready.',
  }, { status: 200 });
}

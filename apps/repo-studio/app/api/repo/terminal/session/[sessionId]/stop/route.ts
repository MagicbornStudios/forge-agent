import { NextResponse } from 'next/server';
import { stopTerminalSession } from '@/lib/terminal-session';

export const runtime = 'nodejs';

export async function POST(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const params = await context.params;
  const sessionId = String(params.sessionId || '').trim();
  const result = stopTerminalSession(sessionId);
  return NextResponse.json({
    ok: result.ok,
    stopped: result.stopped === true,
    message: result.message,
    session: result.session || null,
  }, { status: result.ok ? 200 : 404 });
}

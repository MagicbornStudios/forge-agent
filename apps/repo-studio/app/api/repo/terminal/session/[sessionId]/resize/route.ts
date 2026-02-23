import { NextResponse } from 'next/server';
import { resizeTerminalSession } from '@/lib/terminal-session';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const params = await context.params;
  const sessionId = String(params.sessionId || '').trim();
  const body = await request.json().catch(() => ({}));
  const cols = Number(body?.cols);
  const rows = Number(body?.rows);
  const result = resizeTerminalSession(
    sessionId,
    Number.isFinite(cols) ? cols : 120,
    Number.isFinite(rows) ? rows : 32,
  );
  return NextResponse.json({
    ok: result.ok,
    message: result.message,
  }, { status: result.ok ? 200 : 404 });
}

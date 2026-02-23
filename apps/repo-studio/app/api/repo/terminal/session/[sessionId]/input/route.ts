import { NextResponse } from 'next/server';
import { writeTerminalInput } from '@/lib/terminal-session';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  const params = await context.params;
  const sessionId = String(params.sessionId || '').trim();
  const body = await request.json().catch(() => ({}));
  const result = writeTerminalInput(sessionId, String(body?.data || ''));
  return NextResponse.json({
    ok: result.ok,
    message: result.message,
  }, { status: result.ok ? 200 : 404 });
}

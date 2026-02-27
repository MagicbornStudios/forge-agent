import { NextResponse } from 'next/server';
import { listTerminalSessions } from '@/lib/terminal-session';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const payload = listTerminalSessions();
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      activeSessionId: null,
      sessions: [],
      message: String(error?.message || error || 'Unable to list terminal sessions.'),
    }, { status: 500 });
  }
}

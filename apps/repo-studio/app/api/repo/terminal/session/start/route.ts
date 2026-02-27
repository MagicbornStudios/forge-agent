import { NextResponse } from 'next/server';
import { startTerminalSession } from '@/lib/terminal-session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = startTerminalSession({
      reuse: body?.reuse !== false,
      cwd: body?.cwd,
      cols: body?.cols,
      rows: body?.rows,
      command: body?.command,
      args: body?.args,
      profileId: body?.profileId,
      name: body?.name,
      setActive: body?.setActive !== false,
    });
    return NextResponse.json({
      ok: result.ok,
      reused: result.reused === true,
      session: result.session,
      message: result.message || (result.reused ? 'Reused running terminal session.' : 'Terminal session started.'),
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to start terminal session.'),
    }, { status: 500 });
  }
}

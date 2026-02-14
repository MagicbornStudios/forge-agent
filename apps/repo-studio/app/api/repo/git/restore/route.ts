import { NextResponse } from 'next/server';

import { gitRestore } from '@/lib/git-ops';

export async function POST(request: Request) {
  let body: { paths?: string[]; sourceRef?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const result = gitRestore(Array.isArray(body.paths) ? body.paths : [], String(body.sourceRef || '').trim() || undefined);
    return NextResponse.json({
      ok: result.ok,
      stdout: result.stdout,
      stderr: result.stderr,
      command: result.command,
      message: result.ok ? 'Restore completed.' : 'Restore failed.',
    }, { status: result.ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


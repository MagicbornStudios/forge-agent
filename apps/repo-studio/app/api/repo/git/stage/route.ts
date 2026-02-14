import { NextResponse } from 'next/server';

import { gitStage } from '@/lib/git-ops';

export async function POST(request: Request) {
  let body: { paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const result = gitStage(Array.isArray(body.paths) ? body.paths : []);
    return NextResponse.json({
      ok: result.ok,
      stdout: result.stdout,
      stderr: result.stderr,
      command: result.command,
      message: result.ok ? 'Files staged.' : 'Stage failed.',
    }, { status: result.ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


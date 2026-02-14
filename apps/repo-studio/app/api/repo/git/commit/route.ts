import { NextResponse } from 'next/server';

import { gitCommit } from '@/lib/git-ops';

export async function POST(request: Request) {
  let body: { message?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const result = gitCommit(String(body.message || ''));
    return NextResponse.json({
      ok: result.ok,
      stdout: result.stdout,
      stderr: result.stderr,
      command: result.command,
      message: result.ok ? 'Commit created.' : 'Commit failed.',
    }, { status: result.ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


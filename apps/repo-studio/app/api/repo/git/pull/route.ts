import { NextResponse } from 'next/server';

import { gitPull } from '@/lib/git-ops';

export async function POST(request: Request) {
  let body: { remote?: string; branch?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const result = gitPull(body.remote, body.branch);
  return NextResponse.json({
    ok: result.ok,
    message: result.ok ? 'Git pull completed.' : 'Git pull failed.',
    stdout: result.stdout,
    stderr: result.stderr,
    command: result.command,
  }, { status: result.ok ? 200 : 500 });
}


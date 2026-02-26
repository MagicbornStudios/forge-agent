import { NextResponse } from 'next/server';

import { gitPush } from '@/lib/git-ops';

export async function POST(request: Request) {
  let body: { remote?: string; branch?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const result = gitPush(body.remote, body.branch);
  return NextResponse.json({
    ok: result.ok,
    message: result.ok ? 'Git push completed.' : 'Git push failed.',
    stdout: result.stdout,
    stderr: result.stderr,
    command: result.command,
  }, { status: result.ok ? 200 : 500 });
}


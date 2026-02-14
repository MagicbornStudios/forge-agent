import { NextResponse } from 'next/server';

import { gitLog } from '@/lib/git-ops';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') || '30');
  const result = gitLog(limit);
  return NextResponse.json({
    ok: result.ok,
    entries: (result as any).entries || [],
    stdout: result.stdout,
    stderr: result.stderr,
    command: result.command,
  }, { status: result.ok ? 200 : 500 });
}


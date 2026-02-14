import { NextResponse } from 'next/server';

import { gitStatus } from '@/lib/git-ops';

export async function GET() {
  const result = gitStatus();
  return NextResponse.json({
    ok: result.ok,
    files: (result as any).files || [],
    stdout: result.stdout,
    stderr: result.stderr,
    command: result.command,
  }, { status: result.ok ? 200 : 500 });
}


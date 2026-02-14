import { NextResponse } from 'next/server';

import { stopCodexSession } from '@/lib/codex-session';

export async function POST() {
  const result = await stopCodexSession();
  return NextResponse.json({
    ok: result.ok,
    stopped: result.stopped === true,
    message: result.message,
  }, { status: result.ok ? 200 : 500 });
}

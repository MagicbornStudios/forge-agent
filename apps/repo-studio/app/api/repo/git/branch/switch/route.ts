import { NextResponse } from 'next/server';

import { gitSwitchBranch } from '@/lib/git-ops';

export async function POST(request: Request) {
  let body: { name?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const result = gitSwitchBranch(String(body.name || ''));
    return NextResponse.json({
      ok: result.ok,
      stdout: result.stdout,
      stderr: result.stderr,
      command: result.command,
      message: result.ok ? `Switched to ${body.name}.` : 'Failed to switch branch.',
    }, { status: result.ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


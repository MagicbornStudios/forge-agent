import { NextResponse } from 'next/server';

import { gitCreateBranch } from '@/lib/git-ops';

export async function POST(request: Request) {
  let body: { name?: string; fromRef?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const result = gitCreateBranch(String(body.name || ''), String(body.fromRef || '').trim() || undefined);
    return NextResponse.json({
      ok: result.ok,
      stdout: result.stdout,
      stderr: result.stderr,
      command: result.command,
      message: result.ok ? `Created and switched to ${body.name}.` : 'Failed to create branch.',
    }, { status: result.ok ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


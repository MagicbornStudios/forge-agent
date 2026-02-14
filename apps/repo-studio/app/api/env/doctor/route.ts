import { NextResponse } from 'next/server';
import { runToolCommand } from '@/lib/tool-runner';

export async function POST(request: Request) {
  let body: { profile?: string; mode?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const profile = String(body.profile || 'forge-loop');
  const mode = String(body.mode || 'local');
  const result = runToolCommand('forge-env', [
    'doctor',
    '--profile',
    profile,
    '--mode',
    mode,
  ]);

  return NextResponse.json({
    ok: result.ok,
    report: result.stdout || '',
    stderr: result.stderr || '',
    payload: null,
    attempts: result.attempts || [],
    resolvedAttempt: result.resolvedAttempt || null,
  }, { status: result.ok ? 200 : 500 });
}


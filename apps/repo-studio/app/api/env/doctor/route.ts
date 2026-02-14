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
    '--json',
  ]);

  const payload = (() => {
    try {
      return JSON.parse(String(result.stdout || '{}'));
    } catch {
      return null;
    }
  })();

  return NextResponse.json({
    ok: payload?.ok ?? result.ok,
    report: payload?.report || result.stdout || '',
    stderr: result.stderr || '',
    payload,
    attempts: result.attempts || [],
    resolvedAttempt: result.resolvedAttempt || null,
  }, { status: payload?.ok === false || !result.ok ? 500 : 200 });
}

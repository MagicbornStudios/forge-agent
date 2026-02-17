import { NextResponse } from 'next/server';
import { runToolCommand } from '@/lib/tool-runner';

export const runtime = 'nodejs';

function parseJson(value: string) {
  try {
    return JSON.parse(String(value || '').trim());
  } catch {
    return null;
  }
}

function fallbackErrorMessage(payload: any, stderr: string, defaultMessage: string) {
  if (payload?.message) return String(payload.message);
  const trimmed = String(stderr || '').trim();
  if (trimmed) return trimmed;
  return defaultMessage;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ targetId: string }> },
) {
  const params = await context.params;
  const targetId = String(params.targetId || '').trim();
  if (!targetId) {
    return NextResponse.json({ ok: false, message: 'targetId is required.' }, { status: 400 });
  }

  const url = new URL(request.url);
  const profile = String(url.searchParams.get('profile') || 'forge-agent');
  const mode = String(url.searchParams.get('mode') || 'local');
  const runner = String(url.searchParams.get('runner') || '').trim();
  const args = ['target-read', targetId, '--profile', profile, '--mode', mode, '--json'];
  if (runner) args.push('--runner', runner);

  const result = runToolCommand('forge-env', args);
  const payload = parseJson(result.stdout) || parseJson(result.stderr);
  const ok = Boolean(payload?.ok) && result.ok;
  return NextResponse.json({
    ok,
    ...(payload || {}),
    message: ok ? (payload?.message || '') : fallbackErrorMessage(payload, result.stderr, `Unable to load target ${targetId}.`),
    stderr: payload?.stderr || result.stderr || '',
    attempts: result.attempts || [],
    resolvedAttempt: result.resolvedAttempt || null,
  }, { status: ok ? 200 : 400 });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ targetId: string }> },
) {
  const params = await context.params;
  const targetId = String(params.targetId || '').trim();
  if (!targetId) {
    return NextResponse.json({ ok: false, message: 'targetId is required.' }, { status: 400 });
  }

  let body: {
    profile?: string;
    mode?: string;
    runner?: string;
    values?: Record<string, unknown>;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const profile = String(body.profile || 'forge-agent');
  const mode = String(body.mode || 'local');
  const runner = String(body.runner || '').trim();
  const values = body.values && typeof body.values === 'object' && !Array.isArray(body.values)
    ? body.values
    : {};

  const args = [
    'target-write',
    targetId,
    '--profile',
    profile,
    '--mode',
    mode,
    '--values',
    JSON.stringify(values),
    '--json',
  ];
  if (runner) args.push('--runner', runner);

  const result = runToolCommand('forge-env', args);
  const payload = parseJson(result.stdout) || parseJson(result.stderr);
  const ok = Boolean(payload?.ok) && result.ok;
  return NextResponse.json({
    ok,
    ...(payload || {}),
    message: ok ? (payload?.message || '') : fallbackErrorMessage(payload, result.stderr, `Unable to save target ${targetId}.`),
    stderr: payload?.stderr || result.stderr || '',
    attempts: result.attempts || [],
    resolvedAttempt: result.resolvedAttempt || null,
  }, { status: ok ? 200 : 400 });
}

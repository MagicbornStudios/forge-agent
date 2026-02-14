import { NextResponse } from 'next/server';

import { runRepoStudioCli } from '@/lib/cli-runner';

export async function POST(request: Request) {
  let body: {
    query?: string;
    source?: string;
    status?: string;
    tab?: string;
    sort?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const args = ['commands-view'];
  if (body.query != null) args.push('--query', String(body.query));
  if (body.source != null) args.push('--source', String(body.source));
  if (body.status != null) args.push('--status', String(body.status));
  if (body.tab != null) args.push('--tab', String(body.tab));
  if (body.sort != null) args.push('--sort', String(body.sort));
  args.push('--json');

  const result = runRepoStudioCli(args);
  const payload = result.payload || {};
  return NextResponse.json({
    ok: payload.ok ?? result.ok,
    commandView: payload.commandView || null,
    message: payload.message || (result.ok ? 'Updated command view.' : 'Failed to update command view.'),
    stderr: payload.stderr || result.stderr,
  }, { status: payload.ok === false || !result.ok ? 400 : 200 });
}

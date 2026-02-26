import { NextResponse } from 'next/server';

import { pollGitHubDeviceLogin } from '@/lib/github-oauth';

export async function POST(request: Request) {
  let body: { deviceCode?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const result = await pollGitHubDeviceLogin({
    deviceCode: String(body.deviceCode || ''),
  });
  return NextResponse.json({
    ok: result.ok,
    pending: result.pending === true,
    message: result.message,
    github: result.github,
  }, { status: result.ok ? 200 : 400 });
}


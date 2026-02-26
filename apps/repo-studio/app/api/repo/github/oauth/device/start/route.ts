import { NextResponse } from 'next/server';

import { startGitHubDeviceLogin } from '@/lib/github-oauth';

export async function POST() {
  const result = await startGitHubDeviceLogin();
  return NextResponse.json({
    ok: result.ok,
    message: result.message,
    authUrl: result.authUrl || null,
    deviceCode: result.deviceCode || '',
    userCode: result.userCode || '',
    interval: result.interval || 5,
    expiresIn: result.expiresIn || 0,
    github: result.github,
  }, { status: result.ok ? 200 : 400 });
}


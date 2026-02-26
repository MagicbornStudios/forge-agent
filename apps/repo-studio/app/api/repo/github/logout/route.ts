import { NextResponse } from 'next/server';

import { clearGitHubIntegration, getGitHubAuthStatus } from '@/lib/github-oauth';

export async function POST() {
  await clearGitHubIntegration();
  const status = await getGitHubAuthStatus();
  return NextResponse.json({
    ok: true,
    message: 'GitHub session cleared.',
    github: status.github,
  }, { status: 200 });
}


import { NextResponse } from 'next/server';

import { getGitHubAuthStatus } from '@/lib/github-oauth';

export async function GET() {
  const status = await getGitHubAuthStatus();
  return NextResponse.json({
    ok: true,
    github: status.github,
    message: status.message,
  }, { status: 200 });
}

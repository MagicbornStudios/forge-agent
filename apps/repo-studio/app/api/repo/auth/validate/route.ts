import { NextResponse } from 'next/server';
import { validateRepoAuthStatus } from '@/lib/repo-auth-memory';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const payload = await validateRepoAuthStatus({
    baseUrl: body?.baseUrl,
    token: body?.token,
  });
  return NextResponse.json(payload, {
    status: payload.ok ? 200 : Number(payload.status || 500),
  });
}

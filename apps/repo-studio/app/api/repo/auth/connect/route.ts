import { NextResponse } from 'next/server';
import { connectRepoAuthStatus, validateRepoAuthStatus } from '@/lib/repo-auth-memory';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    connectRepoAuthStatus({
      baseUrl: body?.baseUrl,
      token: body?.token,
    });
    const validation = await validateRepoAuthStatus();
    return NextResponse.json(validation, {
      status: validation.ok ? 200 : Number(validation.status || 500),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        message: error instanceof Error ? error.message : 'Unable to connect.',
      },
      { status: 400 },
    );
  }
}

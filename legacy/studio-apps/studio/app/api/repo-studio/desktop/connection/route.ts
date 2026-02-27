import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { requireRepoStudioDesktopAuth } from '@/lib/server/repo-studio-desktop-auth';

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const auth = await requireRepoStudioDesktopAuth(payload, request);

  if (!auth.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: auth.message,
      },
      { status: auth.status },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      authType: auth.context.authType,
      userId: auth.context.userId,
      organizationId: auth.context.organizationId,
      scopes: auth.context.scopes,
      capabilities: auth.capabilities,
      serverTime: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

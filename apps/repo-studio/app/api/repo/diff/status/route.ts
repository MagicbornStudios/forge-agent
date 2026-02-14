import { NextResponse } from 'next/server';

import { getDiffStatus } from '@/lib/diff-service';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = String(url.searchParams.get('scope') || 'workspace').trim().toLowerCase();
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const result = await getDiffStatus({
    scope: (scope as any),
    loopId,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

import { NextResponse } from 'next/server';

import { getDiffFile } from '@/lib/diff-service';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filePath = String(url.searchParams.get('path') || '').trim();
  const baseRef = String(url.searchParams.get('base') || 'HEAD').trim();
  const headRef = String(url.searchParams.get('head') || 'WORKTREE').trim();
  const scope = String(url.searchParams.get('scope') || 'workspace').trim().toLowerCase();
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const result = await getDiffFile({
    path: filePath,
    base: baseRef,
    head: headRef,
    scope: scope as any,
    loopId,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

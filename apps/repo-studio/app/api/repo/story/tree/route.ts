import { NextResponse } from 'next/server';

import { resolveScopeGuardContext } from '@/lib/scope-guard';
import { listStoryTree } from '@/lib/story-domain';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const domain = String(url.searchParams.get('domain') || 'story').trim().toLowerCase() || 'story';
  const scopeOverrideToken = String(url.searchParams.get('scopeOverrideToken') || '').trim() || undefined;

  try {
    const scope = await resolveScopeGuardContext({
      domain,
      loopId,
      overrideToken: scopeOverrideToken,
    });
    const tree = await listStoryTree(scope.allowedRoots);
    return NextResponse.json({
      ok: true,
      domain: scope.domain,
      roots: scope.allowedRoots,
      tree,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error),
    }, { status: 500 });
  }
}


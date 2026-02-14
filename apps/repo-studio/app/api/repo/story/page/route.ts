import { NextResponse } from 'next/server';

import { enforceScopeGuard, resolveScopeGuardContext } from '@/lib/scope-guard';
import { readStoryPage } from '@/lib/story-domain';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storyPath = String(url.searchParams.get('path') || '').trim();
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const domain = String(url.searchParams.get('domain') || 'story').trim().toLowerCase() || 'story';
  const scopeOverrideToken = String(url.searchParams.get('scopeOverrideToken') || '').trim() || undefined;

  if (!storyPath) {
    return NextResponse.json({ ok: false, message: 'path is required.' }, { status: 400 });
  }

  const guard = await enforceScopeGuard({
    operation: 'story-page-read',
    paths: [storyPath],
    domain,
    loopId,
    overrideToken: scopeOverrideToken,
  });
  if (!guard.ok) {
    return NextResponse.json({
      ok: false,
      message: guard.message || 'Story page read blocked by scope policy.',
      outOfScope: guard.outOfScope,
      scope: guard.context,
    }, { status: 403 });
  }

  try {
    const scope = await resolveScopeGuardContext({ domain, loopId, overrideToken: scopeOverrideToken });
    const page = await readStoryPage(storyPath, scope.allowedRoots);
    return NextResponse.json({
      ok: true,
      domain: scope.domain,
      roots: scope.allowedRoots,
      ...page,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error),
    }, { status: 400 });
  }
}


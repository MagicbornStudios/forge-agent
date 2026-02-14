import { NextResponse } from 'next/server';

import { resolveScopeGuardContext } from '@/lib/scope-guard';
import { readStoryReader } from '@/lib/story-domain';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storyPath = String(url.searchParams.get('path') || '').trim() || undefined;
  const loopId = String(url.searchParams.get('loopId') || '').trim().toLowerCase() || undefined;
  const domain = String(url.searchParams.get('domain') || 'story').trim().toLowerCase() || 'story';
  const scopeOverrideToken = String(url.searchParams.get('scopeOverrideToken') || '').trim() || undefined;

  try {
    const scope = await resolveScopeGuardContext({ domain, loopId, overrideToken: scopeOverrideToken });
    const reader = await readStoryReader(storyPath, scope.allowedRoots);
    return NextResponse.json({
      ok: true,
      domain: scope.domain,
      roots: scope.allowedRoots,
      ...reader,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


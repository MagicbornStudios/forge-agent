import { NextResponse } from 'next/server';

import { resolveScopeGuardContext } from '@/lib/scope-guard';
import { createStoryPage } from '@/lib/story-domain';

export async function POST(request: Request) {
  let body: {
    actIndex?: number;
    chapterIndex?: number;
    pageIndex?: number;
    content?: string;
    domain?: string;
    loopId?: string;
    scopeOverrideToken?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const actIndex = Number(body.actIndex || 1);
  const chapterIndex = Number(body.chapterIndex || 1);
  const pageIndex = Number(body.pageIndex || 1);
  const domain = String(body.domain || 'story').trim().toLowerCase() || 'story';
  const loopId = String(body.loopId || '').trim().toLowerCase() || undefined;
  const scopeOverrideToken = String(body.scopeOverrideToken || '').trim() || undefined;

  if (!Number.isFinite(actIndex) || !Number.isFinite(chapterIndex) || !Number.isFinite(pageIndex)) {
    return NextResponse.json({
      ok: false,
      message: 'actIndex/chapterIndex/pageIndex must be numbers.',
    }, { status: 400 });
  }

  try {
    const scope = await resolveScopeGuardContext({ domain, loopId, overrideToken: scopeOverrideToken });
    const result = await createStoryPage({
      roots: scope.allowedRoots,
      actIndex,
      chapterIndex,
      pageIndex,
      content: String(body.content || ''),
    });
    return NextResponse.json({
      ok: true,
      domain: scope.domain,
      roots: scope.allowedRoots,
      ...result,
      message: `Created ${result.path}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


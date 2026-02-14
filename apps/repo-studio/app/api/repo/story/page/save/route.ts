import { NextResponse } from 'next/server';

import { enforceScopeGuard, resolveScopeGuardContext } from '@/lib/scope-guard';
import { saveStoryPage } from '@/lib/story-domain';

export async function POST(request: Request) {
  let body: {
    path?: string;
    content?: string;
    approved?: boolean;
    domain?: string;
    loopId?: string;
    scopeOverrideToken?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const storyPath = String(body.path || '').trim();
  const domain = String(body.domain || 'story').trim().toLowerCase() || 'story';
  const loopId = String(body.loopId || '').trim().toLowerCase() || undefined;
  const scopeOverrideToken = String(body.scopeOverrideToken || '').trim() || undefined;

  if (!storyPath) {
    return NextResponse.json({ ok: false, message: 'path is required.' }, { status: 400 });
  }
  if (body.approved !== true) {
    return NextResponse.json({ ok: false, message: 'approved=true is required for story save.' }, { status: 403 });
  }

  const guard = await enforceScopeGuard({
    operation: 'story-page-save',
    paths: [storyPath],
    domain,
    loopId,
    overrideToken: scopeOverrideToken,
  });
  if (!guard.ok) {
    return NextResponse.json({
      ok: false,
      message: guard.message || 'Story page save blocked by scope policy.',
      outOfScope: guard.outOfScope,
      scope: guard.context,
    }, { status: 403 });
  }

  try {
    const scope = await resolveScopeGuardContext({ domain, loopId, overrideToken: scopeOverrideToken });
    const result = await saveStoryPage({
      path: storyPath,
      content: String(body.content || ''),
      roots: scope.allowedRoots,
    });
    return NextResponse.json({
      ok: true,
      domain: scope.domain,
      roots: scope.allowedRoots,
      ...result,
      message: `Saved ${result.path}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: String(error?.message || error) }, { status: 400 });
  }
}


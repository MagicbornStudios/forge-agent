import { NextResponse } from 'next/server';

import { buildStoryPublishPreview } from '@/lib/story/publish-service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: {
    path?: string;
    loopId?: string;
    domain?: string;
    scopeOverrideToken?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const targetPath = String(body.path || '').trim();
  if (!targetPath) {
    return NextResponse.json({
      ok: false,
      message: 'path is required.',
    }, { status: 400 });
  }

  try {
    const preview = await buildStoryPublishPreview({
      path: targetPath,
      loopId: String(body.loopId || 'default'),
      domain: String(body.domain || 'story'),
      scopeOverrideToken: String(body.scopeOverrideToken || ''),
    });
    if (!preview.ok) {
      const status = preview.outOfScope ? 403 : 400;
      return NextResponse.json(preview, { status });
    }
    return NextResponse.json(preview);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to build publish preview.'),
    }, { status: 500 });
  }
}

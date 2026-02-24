import { NextResponse } from 'next/server';

import { buildStoryPublishPreview, queueStoryPublishPreview } from '@/lib/story/publish-service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: {
    previewToken?: string;
    path?: string;
    loopId?: string;
    domain?: string;
    scopeOverrideToken?: string;
    assistantTarget?: string;
    threadId?: string;
    turnId?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  let previewToken = String(body.previewToken || '').trim();

  try {
    if (!previewToken) {
      const targetPath = String(body.path || '').trim();
      if (!targetPath) {
        return NextResponse.json({
          ok: false,
          message: 'previewToken or path is required.',
        }, { status: 400 });
      }
      const preview = await buildStoryPublishPreview({
        path: targetPath,
        loopId: String(body.loopId || 'default'),
        domain: String(body.domain || 'story'),
        scopeOverrideToken: String(body.scopeOverrideToken || ''),
      });
      if (!preview.ok || !preview.previewToken) {
        const status = preview.outOfScope ? 403 : 400;
        return NextResponse.json(preview, { status });
      }
      previewToken = preview.previewToken;
    }

    const queued = await queueStoryPublishPreview({
      previewToken,
      assistantTarget: body.assistantTarget,
      threadId: body.threadId,
      turnId: body.turnId,
    });
    if (!queued.ok) {
      return NextResponse.json(queued, { status: 400 });
    }
    return NextResponse.json(queued);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to queue story publish proposal.'),
    }, { status: 500 });
  }
}


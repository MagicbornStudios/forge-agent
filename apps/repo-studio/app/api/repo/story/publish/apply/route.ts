import { NextResponse } from 'next/server';

import { applyStoryPublishPreview, applyStoryPublishProposal } from '@/lib/story/publish-service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: {
    proposalId?: string;
    previewToken?: string;
    approved?: boolean;
    force?: boolean;
  } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const proposalId = String(body.proposalId || '').trim();
  const previewToken = String(body.previewToken || '').trim();

  if (!proposalId && !previewToken) {
    return NextResponse.json({
      ok: false,
      message: 'proposalId or previewToken is required.',
    }, { status: 400 });
  }

  if (body.approved !== true) {
    return NextResponse.json({
      ok: false,
      message: 'approved=true is required for publish apply.',
    }, { status: 403 });
  }

  try {
    const result = proposalId
      ? await applyStoryPublishProposal(proposalId)
      : await applyStoryPublishPreview({
        previewToken,
        approved: true,
        force: body.force === true,
      });

    if (!result.ok) {
      const status = ('outOfScope' in result && Boolean(result.outOfScope)) ? 403 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to apply story publish changes.'),
    }, { status: 500 });
  }
}

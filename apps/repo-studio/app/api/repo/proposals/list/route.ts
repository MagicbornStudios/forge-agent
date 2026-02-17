import { NextResponse } from 'next/server';

import { listProposals } from '@/lib/proposals';
import { resolveReviewQueueTrustMode } from '@/lib/proposals/trust-mode';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const loopId = String(url.searchParams.get('loopId') || 'default').trim().toLowerCase() || 'default';
  const proposals = (await listProposals()).filter((item) => item.loopId === loopId);
  const trust = await resolveReviewQueueTrustMode(loopId);
  return NextResponse.json({
    ok: true,
    proposals,
    pendingCount: proposals.filter((item) => item.status === 'pending').length,
    trustMode: trust.trustMode,
    autoApplyEnabled: trust.autoApplyEnabled,
    lastAutoApplyAt: trust.lastAutoApplyAt,
  });
}

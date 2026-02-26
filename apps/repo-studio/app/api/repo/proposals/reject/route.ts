import { NextResponse } from 'next/server';

import { findProposalById, isProposalStoreUnavailableError, markProposalRejected } from '@/lib/proposals';
import { resolveApproval } from '@/lib/codex-session';

export async function POST(request: Request) {
  let body: { proposalId?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const proposalId = String(body.proposalId || '').trim();
  if (!proposalId) {
    return NextResponse.json({ ok: false, message: 'proposalId is required.' }, { status: 400 });
  }

  try {
    const proposal = await findProposalById(proposalId);
    if (!proposal) {
      return NextResponse.json({ ok: false, message: `Unknown proposal id: ${proposalId}` }, { status: 404 });
    }

    if (proposal.status === 'applied' || proposal.status === 'rejected' || proposal.status === 'failed') {
      return NextResponse.json({
        ok: true,
        noop: true,
        message: `Proposal ${proposal.id} is already ${proposal.status}.`,
        proposal,
      });
    }

    if (proposal.approvalToken) {
      const approval = await resolveApproval(proposal.approvalToken, 'reject');
      if (!approval.ok) {
        return NextResponse.json({
          ok: false,
          message: approval.message || 'Unable to reject proposal approval.',
          approval,
        }, { status: 400 });
      }
    } else {
      const transition = await markProposalRejected(proposal.id);
      if (!transition.ok) {
        return NextResponse.json({
          ok: false,
          message: transition.message || 'Unable to reject proposal transition.',
        }, { status: 503 });
      }
    }

    const updated = await findProposalById(proposal.id);
    return NextResponse.json({
      ok: true,
      proposal: updated,
      message: 'Proposal rejected.',
    });
  } catch (error) {
    if (isProposalStoreUnavailableError(error)) {
      return NextResponse.json(
        { ok: false, message: error.message, code: 'SQLITE_PROPOSALS_UNAVAILABLE' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, message: String((error as Error)?.message || error || 'Unable to reject proposal.') },
      { status: 500 },
    );
  }
}

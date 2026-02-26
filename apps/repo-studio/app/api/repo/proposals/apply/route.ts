import { NextResponse } from 'next/server';

import { findProposalById, isProposalStoreUnavailableError, markProposalApplied } from '@/lib/proposals';
import { resolveApproval } from '@/lib/codex-session';
import { enforceScopeGuard } from '@/lib/scope-guard';
import { applyStoryPublishProposal } from '@/lib/story/publish-service';

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

    if (proposal.kind === 'story-publish') {
      const publishResult = await applyStoryPublishProposal(proposal.id);
      if (!publishResult.ok) {
        return NextResponse.json({
          ok: false,
          message: publishResult.message || 'Unable to apply story publish proposal.',
          publish: publishResult,
        }, { status: 400 });
      }

      const updatedStoryProposal = await findProposalById(proposal.id);
      return NextResponse.json({
        ok: true,
        proposal: updatedStoryProposal,
        message: publishResult.message || 'Story publish proposal applied.',
        publish: publishResult,
      });
    }

    const scope = await enforceScopeGuard({
      operation: 'proposal-apply',
      paths: proposal.files || [],
      domain: proposal.domain,
      loopId: proposal.loopId,
      overrideToken: proposal.scopeOverrideToken,
    });
    if (!scope.ok) {
      return NextResponse.json({
        ok: false,
        message: scope.message || 'Proposal apply is blocked by scope policy.',
        outOfScope: scope.outOfScope,
        scope: scope.context,
      }, { status: 403 });
    }

    if (proposal.approvalToken) {
      const approval = await resolveApproval(proposal.approvalToken, 'approve');
      if (!approval.ok) {
        return NextResponse.json({
          ok: false,
          message: approval.message || 'Unable to apply proposal approval.',
          approval,
        }, { status: 400 });
      }
    } else {
      const transition = await markProposalApplied(proposal.id);
      if (!transition.ok) {
        return NextResponse.json({
          ok: false,
          message: transition.message || 'Unable to apply proposal transition.',
        }, { status: 503 });
      }
    }

    const updated = await findProposalById(proposal.id);
    return NextResponse.json({
      ok: true,
      proposal: updated,
      message: 'Proposal applied.',
    });
  } catch (error) {
    if (isProposalStoreUnavailableError(error)) {
      return NextResponse.json(
        { ok: false, message: error.message, code: 'SQLITE_PROPOSALS_UNAVAILABLE' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, message: String((error as Error)?.message || error || 'Unable to apply proposal.') },
      { status: 500 },
    );
  }
}

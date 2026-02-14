import { NextResponse } from 'next/server';

import { findProposalById, markProposalApplied } from '@/lib/proposals';
import { resolveApproval } from '@/lib/codex-session';
import { enforceScopeGuard } from '@/lib/scope-guard';

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
    await markProposalApplied(proposal.id);
  }

  const updated = await findProposalById(proposal.id);
  return NextResponse.json({
    ok: true,
    proposal: updated,
    message: 'Proposal applied.',
  });
}

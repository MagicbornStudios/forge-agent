import { NextResponse } from 'next/server';

import { resolveApproval } from '@/lib/codex-session';
import { findProposalByApprovalToken } from '@/lib/proposals';
import { enforceScopeGuard } from '@/lib/scope-guard';

export async function POST(request: Request) {
  let body: { approvalToken?: string; decision?: 'approve' | 'reject' | string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const approvalToken = String(body.approvalToken || '').trim();
  const decision = String(body.decision || '').trim().toLowerCase();
  if (!approvalToken) {
    return NextResponse.json({ ok: false, message: 'approvalToken is required.' }, { status: 400 });
  }
  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json({ ok: false, message: 'decision must be "approve" or "reject".' }, { status: 400 });
  }

  if (decision === 'approve') {
    const proposal = await findProposalByApprovalToken(approvalToken);
    if (proposal) {
      const scope = await enforceScopeGuard({
        operation: 'codex-approval',
        paths: proposal.files || [],
        domain: proposal.domain,
        loopId: proposal.loopId,
        overrideToken: proposal.scopeOverrideToken,
      });
      if (!scope.ok) {
        return NextResponse.json({
          ok: false,
          message: scope.message || 'Approval blocked by scope policy.',
          outOfScope: scope.outOfScope,
          scope: scope.context,
        }, { status: 403 });
      }
    }
  }

  const result = await resolveApproval(approvalToken, decision as 'approve' | 'reject');
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

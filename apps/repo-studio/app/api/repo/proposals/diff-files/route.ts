import { NextResponse } from 'next/server';

import { findProposalById } from '@/lib/proposals';
import { parseProposalUnifiedDiff } from '@/lib/proposals/diff-parser';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const proposalId = String(url.searchParams.get('proposalId') || '').trim();

  if (!proposalId) {
    return NextResponse.json({
      ok: false,
      message: 'proposalId is required.',
    }, { status: 400 });
  }

  const proposal = await findProposalById(proposalId);
  if (!proposal) {
    return NextResponse.json({
      ok: false,
      message: `Unknown proposal id: ${proposalId}`,
    }, { status: 404 });
  }

  const parsed = parseProposalUnifiedDiff({
    diff: proposal.diff || '',
    fallbackFiles: proposal.files || [],
  });

  const files = parsed.files.map((entry) => ({
    path: entry.path,
    status: entry.status,
    additions: entry.additions,
    deletions: entry.deletions,
    hasPatch: entry.hasPatch,
  }));

  return NextResponse.json({
    ok: true,
    proposalId: proposal.id,
    files,
    message: parsed.warnings[0] || undefined,
  });
}


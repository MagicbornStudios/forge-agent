import { NextResponse } from 'next/server';

import { findProposalById, isProposalStoreUnavailableError } from '@/lib/proposals';
import { parseProposalUnifiedDiff } from '@/lib/proposals/diff-parser';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const proposalId = String(url.searchParams.get('proposalId') || '').trim();
  const targetPath = String(url.searchParams.get('path') || '').trim();

  if (!proposalId) {
    return NextResponse.json({
      ok: false,
      message: 'proposalId is required.',
    }, { status: 400 });
  }
  if (!targetPath) {
    return NextResponse.json({
      ok: false,
      message: 'path is required.',
    }, { status: 400 });
  }

  let proposal: Awaited<ReturnType<typeof findProposalById>>;
  try {
    proposal = await findProposalById(proposalId);
  } catch (error) {
    if (isProposalStoreUnavailableError(error)) {
      return NextResponse.json(
        { ok: false, message: error.message, code: 'SQLITE_PROPOSALS_UNAVAILABLE' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, message: String((error as Error)?.message || error || 'Unable to read proposal diff.') },
      { status: 500 },
    );
  }

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
  const selected = parsed.files.find((entry) => entry.path === targetPath);
  if (!selected) {
    return NextResponse.json({
      ok: false,
      message: `No diff entry found for path: ${targetPath}`,
    }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    proposalId: proposal.id,
    path: selected.path,
    unifiedPatch: selected.unifiedPatch,
    additions: selected.additions,
    deletions: selected.deletions,
    hunkCount: selected.hunkCount,
    message: parsed.warnings[0] || undefined,
  });
}

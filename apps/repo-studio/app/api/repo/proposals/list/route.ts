import { NextResponse } from 'next/server';

import { listProposals } from '@/lib/proposals';

export async function GET() {
  const proposals = await listProposals();
  return NextResponse.json({
    ok: true,
    proposals,
    pendingCount: proposals.filter((item) => item.status === 'pending').length,
  });
}

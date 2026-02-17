import { getJson, postJson } from '@/lib/api/http';
import type {
  ProposalDiffFileResponse,
  ProposalDiffFilesResponse,
  ProposalMutationResponse,
  ProposalsPayload,
} from '@/lib/api/types';

export async function fetchProposals(loopId?: string) {
  const normalizedLoopId = String(loopId || '').trim().toLowerCase();
  const endpoint = normalizedLoopId
    ? `/api/repo/proposals/list?loopId=${encodeURIComponent(normalizedLoopId)}`
    : '/api/repo/proposals/list';
  return getJson<ProposalsPayload>(endpoint, {
    fallbackMessage: 'Unable to load proposal queue.',
  });
}

export async function applyProposal(proposalId: string) {
  return postJson<ProposalMutationResponse>('/api/repo/proposals/apply', { proposalId }, {
    fallbackMessage: `Unable to apply proposal ${proposalId}.`,
  });
}

export async function rejectProposal(proposalId: string) {
  return postJson<ProposalMutationResponse>('/api/repo/proposals/reject', { proposalId }, {
    fallbackMessage: `Unable to reject proposal ${proposalId}.`,
  });
}

export async function fetchProposalDiffFiles(proposalId: string) {
  const id = String(proposalId || '').trim();
  return getJson<ProposalDiffFilesResponse>(`/api/repo/proposals/diff-files?proposalId=${encodeURIComponent(id)}`, {
    fallbackMessage: `Unable to load proposal file diff summary for ${id}.`,
  });
}

export async function fetchProposalDiffFile(input: { proposalId: string; path: string }) {
  const proposalId = String(input.proposalId || '').trim();
  const path = String(input.path || '').trim();
  const query = new URLSearchParams({
    proposalId,
    path,
  });
  return getJson<ProposalDiffFileResponse>(`/api/repo/proposals/diff-file?${query.toString()}`, {
    fallbackMessage: `Unable to load proposal diff patch for ${proposalId}:${path}.`,
  });
}

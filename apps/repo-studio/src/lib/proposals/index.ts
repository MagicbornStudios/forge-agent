import {
  type RepoProposalStatus,
  type RepoProposalUpsertInput,
} from './contracts';
import {
  findProposalByApprovalTokenFromRepository,
  findProposalByIdFromRepository,
  isProposalStoreUnavailableError,
  listProposalsFromRepository,
  ProposalStoreUnavailableError,
  transitionProposalInRepository,
  upsertPendingProposalInRepository,
} from './repository';

export type { RepoProposal, RepoProposalStatus } from './contracts';
export { isProposalStoreUnavailableError, ProposalStoreUnavailableError };

export async function listProposals() {
  return listProposalsFromRepository();
}

export async function findProposalById(proposalId: string) {
  return findProposalByIdFromRepository(proposalId);
}

export async function findProposalByApprovalToken(approvalToken: string) {
  return findProposalByApprovalTokenFromRepository(approvalToken);
}

export async function upsertPendingProposal(input: RepoProposalUpsertInput) {
  return upsertPendingProposalInRepository(input);
}

async function transitionProposal(proposalId: string, status: RepoProposalStatus, reason?: string) {
  return transitionProposalInRepository(proposalId, status, reason);
}

export async function markProposalApplied(proposalId: string) {
  return transitionProposal(proposalId, 'applied');
}

export async function markProposalRejected(proposalId: string) {
  return transitionProposal(proposalId, 'rejected');
}

export async function markProposalFailed(proposalId: string, reason?: string) {
  return transitionProposal(proposalId, 'failed', reason);
}

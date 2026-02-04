/**
 * AI-generated proposals. Suggested changes (diff/delta) awaiting user accept/reject.
 * Chat creates proposals; workspace applies or rejects via capabilities.
 */

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface Proposal {
  id: string;
  kind: string;
  summary: string;
  status: ProposalStatus;
  createdAt: number;
  /** Opaque patch for the workspace to apply (e.g. graph ops, text diff). */
  patch: unknown;
}

export function createProposal(
  id: string,
  kind: string,
  summary: string,
  patch: unknown
): Proposal {
  return {
    id,
    kind,
    summary,
    status: 'pending',
    createdAt: Date.now(),
    patch,
  };
}

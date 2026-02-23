import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveRepoRoot } from '@/lib/repo-files';
import {
  compareByDateDesc,
  sanitizeProposal,
  type RepoProposal,
} from './contracts';

type LegacyStore = {
  version?: number;
  proposals?: unknown[];
};

function legacyProposalsPath() {
  return path.join(resolveRepoRoot(), '.repo-studio', 'proposals.json');
}

export async function readLegacyProposalStore() {
  try {
    const raw = await fs.readFile(legacyProposalsPath(), 'utf8');
    const parsed = JSON.parse(raw) as LegacyStore;
    const proposals = Array.isArray(parsed?.proposals) ? parsed.proposals : [];
    return proposals
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => sanitizeProposal(entry as Partial<RepoProposal>));
  } catch {
    return [];
  }
}

export async function listLegacyProposals() {
  const entries = await readLegacyProposalStore();
  return [...entries].sort(compareByDateDesc);
}

export async function findLegacyProposalById(proposalId: string) {
  const id = String(proposalId || '').trim();
  if (!id) return null;
  const proposals = await listLegacyProposals();
  return proposals.find((item) => item.id === id) || null;
}

export async function findLegacyProposalByApprovalToken(approvalToken: string) {
  const token = String(approvalToken || '').trim();
  if (!token) return null;
  const proposals = await listLegacyProposals();
  return proposals.find((item) => item.approvalToken === token) || null;
}


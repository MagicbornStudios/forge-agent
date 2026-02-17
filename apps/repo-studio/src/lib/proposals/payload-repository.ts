import {
  compareByDateDesc,
  nowIso,
  sanitizeProposal,
  transitionMessage,
  type RepoProposal,
  type RepoProposalStatus,
  type RepoProposalTransitionResult,
  type RepoProposalUpsertInput,
} from './contracts';
import { getRepoStudioPayload } from '@/lib/payload-client';

const PROPOSALS_COLLECTION = 'repo-proposals';

type PayloadProposalDoc = {
  id?: string;
  proposalId?: string;
  editorTarget?: string;
  loopId?: string;
  domain?: string;
  scopeRoots?: unknown;
  scopeOverrideToken?: string;
  threadId?: string;
  turnId?: string;
  kind?: string;
  summary?: string;
  files?: unknown;
  diff?: string;
  metadata?: unknown;
  status?: RepoProposalStatus;
  approvalToken?: string;
  createdAtIso?: string;
  createdAt?: string;
  resolvedAt?: string | null;
};

function sanitizeStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => String(entry || '').trim()).filter(Boolean))];
}

function toProposal(record: PayloadProposalDoc): RepoProposal | null {
  const proposalId = String(record?.proposalId || '').trim();
  if (!proposalId) return null;
  return sanitizeProposal({
    id: proposalId,
    editorTarget: record.editorTarget,
    loopId: record.loopId,
    domain: record.domain,
    scopeRoots: sanitizeStringList(record.scopeRoots),
    scopeOverrideToken: record.scopeOverrideToken,
    threadId: record.threadId,
    turnId: record.turnId,
    kind: record.kind,
    summary: record.summary,
    files: sanitizeStringList(record.files),
    diff: record.diff,
    metadata: record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)
      ? record.metadata as Record<string, unknown>
      : null,
    status: record.status,
    createdAt: String(record.createdAtIso || record.createdAt || nowIso()),
    resolvedAt: record.resolvedAt ? String(record.resolvedAt) : null,
    approvalToken: record.approvalToken,
  });
}

function toPayloadData(proposal: RepoProposal) {
  return {
    proposalId: proposal.id,
    editorTarget: proposal.editorTarget,
    loopId: proposal.loopId,
    domain: proposal.domain,
    scopeRoots: proposal.scopeRoots,
    scopeOverrideToken: proposal.scopeOverrideToken,
    threadId: proposal.threadId,
    turnId: proposal.turnId,
    kind: proposal.kind,
    summary: proposal.summary,
    files: proposal.files,
    diff: proposal.diff,
    metadata: proposal.metadata,
    status: proposal.status,
    approvalToken: proposal.approvalToken,
    createdAtIso: proposal.createdAt,
    resolvedAt: proposal.resolvedAt,
  };
}

async function findDoc(where: Record<string, unknown>) {
  const payload = await getRepoStudioPayload();
  const result = await payload.find({
    collection: PROPOSALS_COLLECTION,
    where,
    limit: 1,
  });
  const doc = result?.docs?.[0] as PayloadProposalDoc | undefined;
  if (!doc || !doc.id) return null;
  return doc;
}

export async function isSqliteProposalStoreAvailable() {
  try {
    const payload = await getRepoStudioPayload();
    await payload.find({
      collection: PROPOSALS_COLLECTION,
      limit: 1,
    });
    return { ok: true, message: '' };
  } catch (error: any) {
    return {
      ok: false,
      message: String(error?.message || error || 'SQLite proposal store unavailable.'),
    };
  }
}

export async function listSqliteProposals() {
  const payload = await getRepoStudioPayload();
  const result = await payload.find({
    collection: PROPOSALS_COLLECTION,
    limit: 5000,
    sort: '-updatedAt',
  });
  const proposals = (result?.docs || [])
    .map((entry: PayloadProposalDoc) => toProposal(entry))
    .filter(Boolean) as RepoProposal[];
  return proposals.sort(compareByDateDesc);
}

export async function findSqliteProposalById(proposalId: string) {
  const id = String(proposalId || '').trim();
  if (!id) return null;
  const doc = await findDoc({
    proposalId: {
      equals: id,
    },
  });
  return doc ? toProposal(doc) : null;
}

export async function findSqliteProposalByApprovalToken(approvalToken: string) {
  const token = String(approvalToken || '').trim();
  if (!token) return null;
  const doc = await findDoc({
    approvalToken: {
      equals: token,
    },
  });
  return doc ? toProposal(doc) : null;
}

async function saveSqliteProposal(proposal: RepoProposal) {
  const payload = await getRepoStudioPayload();
  const byId = await findDoc({
    proposalId: {
      equals: proposal.id,
    },
  });
  const byToken = !byId && proposal.approvalToken
    ? await findDoc({
      approvalToken: {
        equals: proposal.approvalToken,
      },
    })
    : null;
  const existingDoc = byId || byToken;

  if (existingDoc?.id) {
    const updated = await payload.update({
      collection: PROPOSALS_COLLECTION,
      id: existingDoc.id,
      data: toPayloadData(proposal),
    });
    return toProposal(updated as PayloadProposalDoc) || proposal;
  }

  const created = await payload.create({
    collection: PROPOSALS_COLLECTION,
    data: toPayloadData(proposal),
  });
  return toProposal(created as PayloadProposalDoc) || proposal;
}

export async function importLegacyProposalsToSqlite(entries: RepoProposal[]) {
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of entries) {
    const normalized = sanitizeProposal(entry);
    const existingById = await findDoc({
      proposalId: {
        equals: normalized.id,
      },
    });
    const existingByToken = !existingById && normalized.approvalToken
      ? await findDoc({
        approvalToken: {
          equals: normalized.approvalToken,
        },
      })
      : null;
    const existing = existingById || existingByToken;
    if (!existing) {
      await saveSqliteProposal(normalized);
      imported += 1;
      continue;
    }
    const current = toProposal(existing);
    if (current && current.status === normalized.status && current.diff === normalized.diff) {
      skipped += 1;
      continue;
    }
    await saveSqliteProposal(normalized);
    updated += 1;
  }

  return { imported, updated, skipped };
}

export async function upsertSqlitePendingProposal(input: RepoProposalUpsertInput) {
  const token = String(input.approvalToken || '').trim();
  const existingByToken = token ? await findSqliteProposalByApprovalToken(token) : null;
  const existingById = !existingByToken && input.id ? await findSqliteProposalById(input.id) : null;
  const existing = existingByToken || existingById;

  const next = sanitizeProposal({
    id: existing?.id || input.id,
    editorTarget: input.editorTarget,
    loopId: input.loopId,
    domain: input.domain,
    scopeRoots: input.scopeRoots,
    scopeOverrideToken: input.scopeOverrideToken,
    threadId: input.threadId,
    turnId: input.turnId,
    kind: input.kind,
    summary: input.summary,
    files: input.files,
    diff: input.diff,
    metadata: input.metadata,
    status: 'pending',
    createdAt: existing?.createdAt || input.createdAt || nowIso(),
    resolvedAt: null,
    approvalToken: token,
  });

  return saveSqliteProposal(next);
}

export async function transitionSqliteProposal(
  proposalId: string,
  status: RepoProposalStatus,
  errorText?: string,
): Promise<RepoProposalTransitionResult> {
  const proposal = await findSqliteProposalById(proposalId);
  if (!proposal) {
    return {
      ok: false,
      proposal: null,
      message: `Unknown proposal id: ${proposalId}`,
      noop: false,
    };
  }

  if (proposal.status === 'applied' || proposal.status === 'rejected' || proposal.status === 'failed') {
    return {
      ok: true,
      proposal,
      message: `Proposal ${proposal.id} is already ${proposal.status}.`,
      noop: true,
    };
  }

  const next = sanitizeProposal({
    ...proposal,
    status,
    resolvedAt: nowIso(),
    summary: status === 'failed' && errorText
      ? `${proposal.summary} (apply failed: ${errorText})`
      : proposal.summary,
  });
  const saved = await saveSqliteProposal(next);
  return {
    ok: true,
    proposal: saved,
    message: transitionMessage(status),
    noop: false,
  };
}


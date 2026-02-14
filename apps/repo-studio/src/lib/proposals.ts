import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type RepoProposalStatus = 'pending' | 'applied' | 'rejected' | 'failed';

export type RepoProposal = {
  id: string;
  editorTarget: 'loop-assistant' | 'codex-assistant' | string;
  loopId: string;
  domain: string;
  scopeRoots: string[];
  scopeOverrideToken: string;
  threadId: string;
  turnId: string;
  kind: string;
  summary: string;
  files: string[];
  diff: string;
  status: RepoProposalStatus;
  createdAt: string;
  resolvedAt: string | null;
  approvalToken: string;
};

type RepoProposalStore = {
  version: 1;
  proposals: RepoProposal[];
};

const STORE_VERSION = 1 as const;

function resolveRepoRoot() {
  return path.resolve(process.cwd(), '..', '..');
}

function proposalsPath() {
  return path.join(resolveRepoRoot(), '.repo-studio', 'proposals.json');
}

function nowIso() {
  return new Date().toISOString();
}

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(proposalsPath()), { recursive: true });
}

async function readStore(): Promise<RepoProposalStore> {
  try {
    const raw = await fs.readFile(proposalsPath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<RepoProposalStore>;
    const proposals = Array.isArray(parsed?.proposals) ? parsed.proposals : [];
    return {
      version: STORE_VERSION,
      proposals: proposals
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry) => sanitizeProposal(entry as Partial<RepoProposal>)),
    };
  } catch {
    return { version: STORE_VERSION, proposals: [] };
  }
}

async function writeStore(store: RepoProposalStore) {
  await ensureStoreDir();
  await fs.writeFile(proposalsPath(), `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

function sanitizeList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const normalized = values
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return [...new Set(normalized)];
}

function sanitizeStatus(value: unknown): RepoProposalStatus {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'applied' || normalized === 'rejected' || normalized === 'failed') {
    return normalized;
  }
  return 'pending';
}

function sanitizeProposal(entry: Partial<RepoProposal>): RepoProposal {
  return {
    id: String(entry.id || randomUUID()),
    editorTarget: String(entry.editorTarget || 'codex-assistant'),
    loopId: String(entry.loopId || 'default'),
    domain: String(entry.domain || '').trim().toLowerCase(),
    scopeRoots: sanitizeList(entry.scopeRoots),
    scopeOverrideToken: String(entry.scopeOverrideToken || ''),
    threadId: String(entry.threadId || ''),
    turnId: String(entry.turnId || ''),
    kind: String(entry.kind || 'unknown'),
    summary: String(entry.summary || '').trim() || 'Proposal',
    files: sanitizeList(entry.files),
    diff: String(entry.diff || ''),
    status: sanitizeStatus(entry.status),
    createdAt: String(entry.createdAt || nowIso()),
    resolvedAt: entry.resolvedAt ? String(entry.resolvedAt) : null,
    approvalToken: String(entry.approvalToken || ''),
  };
}

function compareByDateDesc(a: RepoProposal, b: RepoProposal) {
  return String(b.createdAt).localeCompare(String(a.createdAt));
}

export async function listProposals() {
  const store = await readStore();
  return [...store.proposals].sort(compareByDateDesc);
}

export async function findProposalById(proposalId: string) {
  const proposals = await listProposals();
  return proposals.find((item) => item.id === proposalId) || null;
}

export async function findProposalByApprovalToken(approvalToken: string) {
  const token = String(approvalToken || '').trim();
  if (!token) return null;
  const proposals = await listProposals();
  return proposals.find((item) => item.approvalToken === token) || null;
}

export async function upsertPendingProposal(input: {
  id?: string;
  editorTarget: string;
  loopId: string;
  domain?: string;
  scopeRoots?: string[];
  scopeOverrideToken?: string;
  threadId: string;
  turnId: string;
  kind: string;
  summary: string;
  files?: string[];
  diff?: string;
  approvalToken: string;
}) {
  const store = await readStore();
  const token = String(input.approvalToken || '').trim();
  const existingIndex = store.proposals.findIndex((entry) => entry.approvalToken === token && token.length > 0);
  const next: RepoProposal = sanitizeProposal({
    id: existingIndex >= 0 ? store.proposals[existingIndex]?.id : input.id,
    editorTarget: input.editorTarget,
    loopId: input.loopId,
    domain: String(input.domain || '').trim().toLowerCase(),
    scopeRoots: input.scopeRoots || [],
    scopeOverrideToken: String(input.scopeOverrideToken || ''),
    threadId: input.threadId,
    turnId: input.turnId,
    kind: input.kind,
    summary: input.summary,
    files: input.files || [],
    diff: input.diff || '',
    status: 'pending',
    createdAt: existingIndex >= 0 ? store.proposals[existingIndex]?.createdAt : nowIso(),
    resolvedAt: null,
    approvalToken: token,
  });

  if (existingIndex >= 0) {
    store.proposals[existingIndex] = next;
  } else {
    store.proposals.push(next);
  }

  await writeStore(store);
  return next;
}

function transitionMessage(status: RepoProposalStatus) {
  if (status === 'applied') return 'Proposal applied.';
  if (status === 'rejected') return 'Proposal rejected.';
  return 'Proposal marked failed.';
}

async function transitionProposal(proposalId: string, status: RepoProposalStatus, errorText?: string) {
  const store = await readStore();
  const index = store.proposals.findIndex((entry) => entry.id === proposalId);
  if (index < 0) {
    return {
      ok: false,
      proposal: null,
      message: `Unknown proposal id: ${proposalId}`,
      noop: false,
    };
  }

  const existing = store.proposals[index];
  if (existing.status === 'applied' || existing.status === 'rejected' || existing.status === 'failed') {
    return {
      ok: true,
      proposal: existing,
      message: `Proposal ${existing.id} is already ${existing.status}.`,
      noop: true,
    };
  }

  const next = sanitizeProposal({
    ...existing,
    status,
    resolvedAt: nowIso(),
    summary: status === 'failed' && errorText
      ? `${existing.summary} (apply failed: ${errorText})`
      : existing.summary,
  });
  store.proposals[index] = next;
  await writeStore(store);
  return {
    ok: true,
    proposal: next,
    message: transitionMessage(status),
    noop: false,
  };
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

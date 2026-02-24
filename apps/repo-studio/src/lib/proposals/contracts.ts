import { randomUUID } from 'node:crypto';

export type RepoProposalStatus = 'pending' | 'applied' | 'rejected' | 'failed';

export type RepoProposal = {
  id: string;
  assistantTarget: 'loop-assistant' | 'codex-assistant' | string;
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
  metadata: Record<string, unknown> | null;
  status: RepoProposalStatus;
  createdAt: string;
  resolvedAt: string | null;
  approvalToken: string;
};

export type RepoProposalUpsertInput = {
  id?: string;
  assistantTarget: string;
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
  metadata?: Record<string, unknown> | null;
  approvalToken: string;
  createdAt?: string;
};

export type RepoProposalTransitionResult = {
  ok: boolean;
  proposal: RepoProposal | null;
  message: string;
  noop: boolean;
};

export function nowIso() {
  return new Date().toISOString();
}

export function sanitizeList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const normalized = values
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return [...new Set(normalized)];
}

export function sanitizeStatus(value: unknown): RepoProposalStatus {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'applied' || normalized === 'rejected' || normalized === 'failed') {
    return normalized;
  }
  return 'pending';
}

export function sanitizeMetadata(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function sanitizeProposal(entry: Partial<RepoProposal>): RepoProposal {
  return {
    id: String(entry.id || randomUUID()),
    assistantTarget: String(entry.assistantTarget || 'codex-assistant'),
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
    metadata: sanitizeMetadata(entry.metadata),
    status: sanitizeStatus(entry.status),
    createdAt: String(entry.createdAt || nowIso()),
    resolvedAt: entry.resolvedAt ? String(entry.resolvedAt) : null,
    approvalToken: String(entry.approvalToken || ''),
  };
}

export function compareByDateDesc(a: RepoProposal, b: RepoProposal) {
  return String(b.createdAt).localeCompare(String(a.createdAt));
}

export function transitionMessage(status: RepoProposalStatus) {
  if (status === 'applied') return 'Proposal applied.';
  if (status === 'rejected') return 'Proposal rejected.';
  return 'Proposal marked failed.';
}



import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { parseStoryMarkdownToBlocks } from '../../../../../packages/repo-studio/src/core/parsers/story.mjs';
import { findProposalById, markProposalApplied, markProposalFailed, upsertPendingProposal, type RepoProposal } from '@/lib/proposals';
import { recordReviewQueueAutoApply, resolveReviewQueueTrustMode } from '@/lib/proposals/trust-mode';
import { enforceScopeGuard, resolveScopeGuardContext } from '@/lib/scope-guard';
import { normalizeRelPath, resolveRepoRoot } from '@/lib/repo-files';
import { readStoryPage } from '@/lib/story-domain';
import {
  findRepoPageBySource,
  listRepoBlocksForPage,
  replaceRepoBlocksForPage,
  upsertRepoPage,
  type RepoBlockDraft,
} from '@/lib/story/publish-repository';

type StoryPublishPreviewStoreEntry = {
  token: string;
  createdAt: string;
  loopId: string;
  domain: string;
  path: string;
  scopeOverrideToken: string;
  pageDraft: {
    sourcePath: string;
    title: string;
    slug: string;
    metadata: Record<string, unknown>;
  };
  blocksDraft: Array<{
    id: string;
    type: string;
    position: number;
    payload: Record<string, unknown>;
    sourceHash: string;
  }>;
  contentHash: string;
  changedSummary: {
    changed: boolean;
    existingHash: string | null;
    nextHash: string;
    previousBlockCount: number;
    nextBlockCount: number;
  };
  warnings: string[];
};

type StoryPublishPreviewStore = {
  version: 1;
  entries: StoryPublishPreviewStoreEntry[];
};

const PREVIEW_STORE_VERSION = 1 as const;
const PREVIEW_TTL_MS = 1000 * 60 * 60 * 8;

function nowIso() {
  return new Date().toISOString();
}

function hashText(value: string) {
  return createHash('sha1').update(String(value || '')).digest('hex');
}

function previewStorePath() {
  return path.join(resolveRepoRoot(), '.repo-studio', 'story-publish-previews.json');
}

function normalizePreviewEntry(input: Partial<StoryPublishPreviewStoreEntry>): StoryPublishPreviewStoreEntry | null {
  const token = String(input.token || '').trim();
  const loopId = String(input.loopId || '').trim().toLowerCase();
  const domain = String(input.domain || '').trim().toLowerCase();
  const sourcePath = normalizeRelPath(String(input.path || ''));
  const contentHash = String(input.contentHash || '').trim();
  if (!token || !loopId || !domain || !sourcePath || !contentHash) return null;

  const pageDraft = input.pageDraft && typeof input.pageDraft === 'object'
    ? input.pageDraft
    : { sourcePath, title: path.basename(sourcePath, path.extname(sourcePath)), slug: path.basename(sourcePath, path.extname(sourcePath)), metadata: {} };
  const metadata = pageDraft.metadata && typeof pageDraft.metadata === 'object' && !Array.isArray(pageDraft.metadata)
    ? pageDraft.metadata as Record<string, unknown>
    : {};
  const blocksDraft = Array.isArray(input.blocksDraft)
    ? input.blocksDraft
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry, index) => ({
        id: String(entry.id || `blk-${index + 1}`),
        type: String(entry.type || 'paragraph'),
        position: Number(entry.position || index + 1),
        payload: entry.payload && typeof entry.payload === 'object' && !Array.isArray(entry.payload)
          ? entry.payload as Record<string, unknown>
          : {},
        sourceHash: String(entry.sourceHash || ''),
      }))
    : [];
  const changedSummarySource: Record<string, unknown> = input.changedSummary && typeof input.changedSummary === 'object'
    ? input.changedSummary as Record<string, unknown>
    : {};

  return {
    token,
    createdAt: String(input.createdAt || nowIso()),
    loopId,
    domain,
    path: sourcePath,
    scopeOverrideToken: String(input.scopeOverrideToken || ''),
    pageDraft: {
      sourcePath: normalizeRelPath(String(pageDraft.sourcePath || sourcePath)),
      title: String(pageDraft.title || path.basename(sourcePath, path.extname(sourcePath))),
      slug: String(pageDraft.slug || path.basename(sourcePath, path.extname(sourcePath))).trim(),
      metadata,
    },
    blocksDraft,
    contentHash,
    changedSummary: {
      changed: Boolean(changedSummarySource.changed),
      existingHash: changedSummarySource.existingHash ? String(changedSummarySource.existingHash) : null,
      nextHash: String(changedSummarySource.nextHash || contentHash),
      previousBlockCount: Number(changedSummarySource.previousBlockCount || 0),
      nextBlockCount: Number(changedSummarySource.nextBlockCount || blocksDraft.length),
    },
    warnings: Array.isArray(input.warnings)
      ? input.warnings.map((entry) => String(entry || '').trim()).filter(Boolean)
      : [],
  };
}

async function readPreviewStore(): Promise<StoryPublishPreviewStore> {
  try {
    const raw = await fs.readFile(previewStorePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoryPublishPreviewStore>;
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.map((entry) => normalizePreviewEntry(entry || {})).filter(Boolean) as StoryPublishPreviewStoreEntry[]
      : [];
    return {
      version: PREVIEW_STORE_VERSION,
      entries,
    };
  } catch {
    return {
      version: PREVIEW_STORE_VERSION,
      entries: [],
    };
  }
}

async function writePreviewStore(store: StoryPublishPreviewStore) {
  await fs.mkdir(path.dirname(previewStorePath()), { recursive: true });
  await fs.writeFile(previewStorePath(), `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

function prunePreviewEntries(entries: StoryPublishPreviewStoreEntry[]) {
  const cutoff = Date.now() - PREVIEW_TTL_MS;
  return entries.filter((entry) => {
    const createdAt = Date.parse(entry.createdAt || '');
    if (!Number.isFinite(createdAt)) return false;
    return createdAt >= cutoff;
  });
}

function titleFromBlocks(pathValue: string, blocks: Array<{ type: string; payload: Record<string, unknown> }>) {
  const heading = blocks.find((entry) => entry.type === 'heading_1');
  const headingText = String(heading?.payload?.text || '').trim();
  if (headingText) return headingText;
  const fallback = path.basename(pathValue, path.extname(pathValue)).replace(/[-_]/g, ' ').trim();
  return fallback || 'Story Page';
}

function slugFromPath(pathValue: string) {
  return normalizeRelPath(pathValue)
    .replace(/\.md$/i, '')
    .split('/')
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function buildStoryPublishPreview(input: {
  path: string;
  loopId: string;
  domain: string;
  scopeOverrideToken?: string;
}) {
  const normalizedPath = normalizeRelPath(input.path);
  const loopId = String(input.loopId || 'default').trim().toLowerCase() || 'default';
  const domain = String(input.domain || 'story').trim().toLowerCase() || 'story';
  const scopeOverrideToken = String(input.scopeOverrideToken || '').trim();

  const guard = await enforceScopeGuard({
    operation: 'story-publish-preview',
    paths: [normalizedPath],
    domain,
    loopId,
    overrideToken: scopeOverrideToken || undefined,
  });
  if (!guard.ok) {
    return {
      ok: false,
      message: guard.message || 'Story publish preview blocked by scope policy.',
      outOfScope: guard.outOfScope,
      scope: guard.context,
    };
  }

  const scope = await resolveScopeGuardContext({
    domain,
    loopId,
    overrideToken: scopeOverrideToken || undefined,
  });
  const page = await readStoryPage(normalizedPath, scope.allowedRoots);
  const parsed = parseStoryMarkdownToBlocks(page.content);
  const existingPage = await findRepoPageBySource(loopId, normalizedPath);
  const previousBlocks = existingPage?.id ? await listRepoBlocksForPage(existingPage.id) : [];
  const changedSummary = {
    changed: existingPage?.contentHash !== parsed.contentHash || previousBlocks.length !== parsed.blocks.length,
    existingHash: existingPage?.contentHash || null,
    nextHash: parsed.contentHash,
    previousBlockCount: previousBlocks.length,
    nextBlockCount: parsed.blocks.length,
  };

  const pageDraft = {
    sourcePath: normalizedPath,
    title: titleFromBlocks(normalizedPath, parsed.blocks),
    slug: slugFromPath(normalizedPath),
    metadata: {
      domain,
      loopId,
      generatedAt: nowIso(),
    },
  };

  const previewToken = hashText(`${loopId}:${normalizedPath}:${parsed.contentHash}`);
  const entry = normalizePreviewEntry({
    token: previewToken,
    createdAt: nowIso(),
    loopId,
    domain,
    path: normalizedPath,
    scopeOverrideToken,
    pageDraft,
    blocksDraft: parsed.blocks,
    contentHash: parsed.contentHash,
    changedSummary,
    warnings: parsed.warnings,
  });

  if (!entry) {
    return {
      ok: false,
      message: 'Unable to build preview payload.',
    };
  }

  const store = await readPreviewStore();
  const nextEntries = prunePreviewEntries(store.entries).filter((item) => item.token !== entry.token);
  nextEntries.push(entry);
  await writePreviewStore({
    version: PREVIEW_STORE_VERSION,
    entries: nextEntries.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
  });

  return {
    ok: true,
    previewToken: entry.token,
    path: entry.path,
    loopId: entry.loopId,
    domain: entry.domain,
    pageDraft: entry.pageDraft,
    blocksDraft: entry.blocksDraft,
    contentHash: entry.contentHash,
    changedSummary: entry.changedSummary,
    warnings: entry.warnings,
  };
}

export async function getStoryPublishPreviewByToken(previewToken: string) {
  const token = String(previewToken || '').trim();
  if (!token) return null;
  const store = await readPreviewStore();
  const entries = prunePreviewEntries(store.entries);
  const match = entries.find((entry) => entry.token === token) || null;
  if (entries.length !== store.entries.length) {
    await writePreviewStore({
      version: PREVIEW_STORE_VERSION,
      entries,
    });
  }
  return match;
}

function buildPublishDiff(entry: StoryPublishPreviewStoreEntry) {
  return [
    '# Story Publish Preview',
    '',
    `path: ${entry.path}`,
    `loopId: ${entry.loopId}`,
    `domain: ${entry.domain}`,
    `existingHash: ${entry.changedSummary.existingHash || '(none)'}`,
    `nextHash: ${entry.changedSummary.nextHash}`,
    `previousBlocks: ${entry.changedSummary.previousBlockCount}`,
    `nextBlocks: ${entry.changedSummary.nextBlockCount}`,
    '',
    '## Warnings',
    ...(entry.warnings.length > 0 ? entry.warnings.map((warning) => `- ${warning}`) : ['- none']),
  ].join('\n');
}

export async function queueStoryPublishPreview(input: {
  previewToken: string;
  editorTarget?: string;
  threadId?: string;
  turnId?: string;
}) {
  const preview = await getStoryPublishPreviewByToken(input.previewToken);
  if (!preview) {
    return {
      ok: false,
      message: `Unknown or expired preview token: ${input.previewToken}`,
    };
  }

  const proposal = await upsertPendingProposal({
    id: `story-publish:${preview.token}`,
    editorTarget: String(input.editorTarget || 'loop-assistant'),
    loopId: preview.loopId,
    domain: preview.domain,
    scopeRoots: [path.dirname(preview.path)],
    scopeOverrideToken: preview.scopeOverrideToken,
    threadId: String(input.threadId || ''),
    turnId: String(input.turnId || ''),
    kind: 'story-publish',
    summary: `Publish story file ${preview.path} into repo-pages/repo-blocks`,
    files: [preview.path],
    diff: buildPublishDiff(preview),
    metadata: {
      previewToken: preview.token,
      path: preview.path,
      loopId: preview.loopId,
      domain: preview.domain,
      contentHash: preview.contentHash,
    },
    approvalToken: '',
  });

  const trust = await resolveReviewQueueTrustMode(preview.loopId);
  if (trust.autoApplyEnabled) {
    const applied = await applyStoryPublishProposal(proposal.id);
    if (applied.ok) {
      await recordReviewQueueAutoApply(preview.loopId).catch(() => {});
    }
    const refreshed = await findProposalById(proposal.id);
    return {
      ok: applied.ok,
      proposalId: proposal.id,
      status: refreshed?.status || (applied.ok ? 'applied' : 'failed'),
      proposal: refreshed || proposal,
      message: applied.message || (applied.ok ? `Auto-applied ${proposal.id}.` : `Auto-apply failed for ${proposal.id}.`),
    };
  }

  return {
    ok: true,
    proposalId: proposal.id,
    status: proposal.status,
    proposal,
    message: `Queued publish proposal ${proposal.id}.`,
  };
}

function toBlockDrafts(entry: StoryPublishPreviewStoreEntry): RepoBlockDraft[] {
  return entry.blocksDraft.map((block) => ({
    type: block.type,
    position: block.position,
    payload: block.payload,
    sourceHash: block.sourceHash,
  }));
}

export async function applyStoryPublishPreview(input: {
  previewToken: string;
  approved: boolean;
  force?: boolean;
}) {
  if (input.approved !== true) {
    return {
      ok: false,
      status: 'failed',
      message: 'approved=true is required for publish apply.',
    };
  }

  const preview = await getStoryPublishPreviewByToken(input.previewToken);
  if (!preview) {
    return {
      ok: false,
      status: 'failed',
      message: `Unknown or expired preview token: ${input.previewToken}`,
    };
  }

  const guard = await enforceScopeGuard({
    operation: 'story-publish-apply',
    paths: [preview.path],
    domain: preview.domain,
    loopId: preview.loopId,
    overrideToken: preview.scopeOverrideToken || undefined,
  });
  if (!guard.ok) {
    return {
      ok: false,
      status: 'failed',
      message: guard.message || 'Story publish apply blocked by scope policy.',
      outOfScope: guard.outOfScope,
      scope: guard.context,
    };
  }

  const existingPage = await findRepoPageBySource(preview.loopId, preview.path);
  const existingBlocks = existingPage?.id ? await listRepoBlocksForPage(existingPage.id) : [];
  const unchanged = existingPage?.contentHash === preview.contentHash
    && existingBlocks.length === preview.blocksDraft.length;
  if (unchanged && input.force !== true) {
    return {
      ok: true,
      status: 'applied',
      pageId: existingPage.id,
      blockCount: existingBlocks.length,
      noop: true,
      message: `No changes detected for ${preview.path}.`,
    };
  }

  const pageRecord = await upsertRepoPage({
    loopId: preview.loopId,
    sourcePath: preview.path,
    title: preview.pageDraft.title,
    slug: preview.pageDraft.slug,
    contentHash: preview.contentHash,
    metadata: preview.pageDraft.metadata,
  });
  if (!pageRecord?.id) {
    return {
      ok: false,
      status: 'failed',
      message: 'Unable to upsert repo page record.',
    };
  }

  const blocks = await replaceRepoBlocksForPage(pageRecord.id, toBlockDrafts(preview));
  return {
    ok: true,
    status: 'applied',
    pageId: pageRecord.id,
    blockCount: blocks.length,
    noop: false,
    message: `Published ${preview.path} (${blocks.length} blocks).`,
  };
}

function metadataPreviewToken(proposal: RepoProposal) {
  const metadata = proposal.metadata && typeof proposal.metadata === 'object'
    ? proposal.metadata
    : {};
  const token = String((metadata as Record<string, unknown>).previewToken || '').trim();
  return token || null;
}

export async function applyStoryPublishProposal(proposalId: string) {
  const proposal = await findProposalById(proposalId);
  if (!proposal) {
    return {
      ok: false,
      status: 'failed',
      message: `Unknown proposal id: ${proposalId}`,
    };
  }

  const previewToken = metadataPreviewToken(proposal);
  if (!previewToken) {
    await markProposalFailed(proposal.id, 'missing preview token');
    return {
      ok: false,
      status: 'failed',
      message: 'Story publish proposal is missing preview token metadata.',
    };
  }

  const applied = await applyStoryPublishPreview({
    previewToken,
    approved: true,
  });

  if (!applied.ok) {
    await markProposalFailed(proposal.id, applied.message || 'publish apply failed');
    return applied;
  }

  const transition = await markProposalApplied(proposal.id);
  if (!transition.ok) {
    return {
      ok: false,
      status: 'failed',
      message: transition.message || 'Story publish proposal apply persisted but transition update failed.',
    };
  }
  return {
    ...applied,
    proposalId: proposal.id,
  };
}

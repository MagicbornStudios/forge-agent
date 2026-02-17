import { nowIso } from './contracts';
import { getRepoSettingsSnapshot, upsertRepoSettings } from '@/lib/settings/repository';

export type ReviewQueueTrustMode = 'require-approval' | 'auto-approve-all';

function normalizeTrustMode(value: unknown): ReviewQueueTrustMode {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'auto-approve-all' ? 'auto-approve-all' : 'require-approval';
}

export async function resolveReviewQueueTrustMode(loopId: string) {
  try {
    const snapshot = await getRepoSettingsSnapshot({
      workspaceId: 'review-queue',
      loopId: String(loopId || 'default').trim().toLowerCase() || 'default',
    });
    const merged = snapshot?.merged && typeof snapshot.merged === 'object'
      ? snapshot.merged as Record<string, unknown>
      : {};
    const reviewQueue = merged.reviewQueue && typeof merged.reviewQueue === 'object'
      ? merged.reviewQueue as Record<string, unknown>
      : {};
    const trustMode = normalizeTrustMode(reviewQueue.trustMode);
    const lastAutoApplyAt = String(reviewQueue.lastAutoApplyAt || '').trim() || null;
    return {
      trustMode,
      autoApplyEnabled: trustMode === 'auto-approve-all',
      lastAutoApplyAt,
    };
  } catch {
    return {
      trustMode: 'require-approval' as const,
      autoApplyEnabled: false,
      lastAutoApplyAt: null,
    };
  }
}

export async function recordReviewQueueAutoApply(loopId: string) {
  const timestamp = nowIso();
  await upsertRepoSettings({
    scope: 'local',
    scopeId: 'default',
    workspaceId: 'review-queue',
    loopId,
    settings: {
      reviewQueue: {
        lastAutoApplyAt: timestamp,
      },
    },
  });
  return timestamp;
}


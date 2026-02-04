/**
 * Draft state: uncommitted changes. Chat-first workspaces track dirty state
 * and optional "what changed recently" for context.
 */

export interface Draft {
  dirty: boolean;
  lastEditedAt: number | null;
  lastCommittedAt: number | null;
}

export interface RecentChange {
  at: number;
  summary: string;
  kind?: string;
}

export interface DraftState extends Draft {
  recentChanges?: RecentChange[];
}

export function createInitialDraft(): Draft {
  return {
    dirty: false,
    lastEditedAt: null,
    lastCommittedAt: Date.now(),
  };
}

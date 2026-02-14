export const REPO_WORKSPACE_IDS = [
  'planning',
  'env',
  'commands',
  'story',
  'docs',
  'git',
  'loop-assistant',
  'codex-assistant',
  'diff',
  'code',
  'review-queue',
] as const;
export type RepoWorkspaceId = (typeof REPO_WORKSPACE_IDS)[number];

export const REPO_COMMAND_VIEW_TABS = ['recommended', 'all', 'blocked'] as const;
export type RepoCommandViewTab = (typeof REPO_COMMAND_VIEW_TABS)[number];

export const REPO_COMMAND_SORT_OPTIONS = ['id', 'source', 'command'] as const;
export type RepoCommandSort = (typeof REPO_COMMAND_SORT_OPTIONS)[number];

export type RepoCommandView = {
  query: string;
  source: string;
  status: 'all' | 'allowed' | 'blocked';
  tab: RepoCommandViewTab;
  sort: RepoCommandSort;
};

export type RepoRunRef = {
  id: string;
  stopPath: string;
};

export type RepoReviewQueueState = {
  collapsed: boolean;
  selectedProposalId: string | null;
};

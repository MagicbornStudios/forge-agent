/** Re-exported from app-spec (single source of truth). Prefer importing from @/lib/app-spec.generated. */
export { WORKSPACE_IDS as REPO_WORKSPACE_IDS, type WorkspaceId as RepoWorkspaceId } from './app-spec.generated';

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

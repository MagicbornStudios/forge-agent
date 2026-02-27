import { WORKSPACE_IDS } from './app-spec.generated';

/** Built-in workspace ids generated from app-spec (extensions are runtime dynamic). */
export const REPO_WORKSPACE_IDS = WORKSPACE_IDS as readonly string[];

/** Repo Studio workspace ids are dynamic (built-ins + discovered extensions). */
export type RepoWorkspaceId = string;

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

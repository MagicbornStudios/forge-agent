import type { AppShellWorkspaceId } from './store';

export const WORKSPACE_LABELS: Record<AppShellWorkspaceId, string> = {
  forge: 'Forge',
  video: 'Video',
};

export const WORKSPACE_EDITOR_SUMMARY: Record<AppShellWorkspaceId, string> = {
  forge: 'graph editor (React Flow)',
  video: 'timeline',
};

export const WORKSPACE_EDITOR_IDS: Record<AppShellWorkspaceId, string> = {
  forge: 'forge-graph',
  video: 'video-timeline',
};

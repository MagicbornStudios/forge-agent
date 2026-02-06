import type { AppShellWorkspaceId } from './store';

export const WORKSPACE_LABELS: Record<AppShellWorkspaceId, string> = {
  forge: 'Forge',
  video: 'Video',
  character: 'Characters',
};

export const WORKSPACE_EDITOR_SUMMARY: Record<AppShellWorkspaceId, string> = {
  forge: 'graph editor (React Flow)',
  video: 'timeline',
  character: 'character relationship graph (React Flow)',
};

export const WORKSPACE_EDITOR_IDS: Record<AppShellWorkspaceId, string> = {
  forge: 'forge-graph',
  video: 'video-timeline',
  character: 'character-graph',
};

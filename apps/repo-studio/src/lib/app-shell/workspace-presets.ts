import { REPO_WORKSPACE_IDS, type RepoWorkspaceId } from '@/lib/types';
import { REPO_EDITOR_PANEL_SPECS } from './editor-panels';

export type RepoWorkspacePreset = {
  workspaceId: RepoWorkspaceId;
  mainAnchorPanelId: string;
  corePanelIds: string[];
  supportPanelIds: string[];
};

const PRESETS: Record<RepoWorkspaceId, RepoWorkspacePreset> = {
  planning: {
    workspaceId: 'planning',
    mainAnchorPanelId: 'planning',
    corePanelIds: ['planning'],
    supportPanelIds: ['loop-cadence', 'loop-assistant'],
  },
  env: {
    workspaceId: 'env',
    mainAnchorPanelId: 'planning',
    corePanelIds: ['env'],
    supportPanelIds: ['planning'],
  },
  commands: {
    workspaceId: 'commands',
    mainAnchorPanelId: 'commands',
    corePanelIds: ['commands', 'terminal'],
    supportPanelIds: ['loop-cadence'],
  },
  story: {
    workspaceId: 'story',
    mainAnchorPanelId: 'story',
    corePanelIds: ['story'],
    supportPanelIds: ['loop-assistant', 'docs'],
  },
  code: {
    workspaceId: 'code',
    mainAnchorPanelId: 'code',
    corePanelIds: ['code', 'diff', 'git'],
    supportPanelIds: ['codex-assistant'],
  },
  git: {
    workspaceId: 'git',
    mainAnchorPanelId: 'code',
    corePanelIds: ['git', 'diff'],
    supportPanelIds: ['code'],
  },
  diff: {
    workspaceId: 'diff',
    mainAnchorPanelId: 'code',
    corePanelIds: ['diff', 'git'],
    supportPanelIds: ['code'],
  },
  docs: {
    workspaceId: 'docs',
    mainAnchorPanelId: 'planning',
    corePanelIds: ['docs'],
    supportPanelIds: ['planning'],
  },
  'loop-assistant': {
    workspaceId: 'loop-assistant',
    mainAnchorPanelId: 'planning',
    corePanelIds: ['loop-assistant'],
    supportPanelIds: ['planning'],
  },
  'codex-assistant': {
    workspaceId: 'codex-assistant',
    mainAnchorPanelId: 'code',
    corePanelIds: ['codex-assistant'],
    supportPanelIds: ['review-queue'],
  },
  'review-queue': {
    workspaceId: 'review-queue',
    mainAnchorPanelId: 'code',
    corePanelIds: ['review-queue', 'diff'],
    supportPanelIds: ['codex-assistant'],
  },
};

const ALL_PANEL_IDS = new Set(REPO_EDITOR_PANEL_SPECS.map((spec) => spec.id));

function normalizePanelIds(panelIds: string[]) {
  return [...new Set(
    panelIds
      .map((panelId) => String(panelId || '').trim())
      .filter((panelId) => panelId.length > 0 && ALL_PANEL_IDS.has(panelId)),
  )];
}

export function getWorkspacePreset(workspaceId: RepoWorkspaceId): RepoWorkspacePreset {
  return PRESETS[workspaceId];
}

export function getWorkspaceVisiblePanelIds(workspaceId: RepoWorkspaceId) {
  const preset = getWorkspacePreset(workspaceId);
  return normalizePanelIds([
    preset.mainAnchorPanelId,
    ...preset.corePanelIds,
    ...preset.supportPanelIds,
  ]);
}

export function getWorkspaceHiddenPanelIds(workspaceId: RepoWorkspaceId) {
  const visible = new Set(getWorkspaceVisiblePanelIds(workspaceId));
  return REPO_EDITOR_PANEL_SPECS
    .map((spec) => spec.id)
    .filter((panelId) => !visible.has(panelId));
}

export function createWorkspaceHiddenPanelMapFromPresets() {
  return REPO_WORKSPACE_IDS.reduce((acc, workspaceId) => {
    acc[workspaceId] = getWorkspaceHiddenPanelIds(workspaceId);
    return acc;
  }, {} as Record<RepoWorkspaceId, string[]>);
}

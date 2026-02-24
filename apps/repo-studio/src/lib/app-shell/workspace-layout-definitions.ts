import { REPO_WORKSPACE_IDS, type RepoWorkspaceId } from '@/lib/types';

export type RepoPanelRail = 'left' | 'main' | 'right' | 'bottom';

export const REPO_PANEL_IDS = [
  'loop-cadence',
  'planning',
  'env',
  'commands',
  'story',
  'docs',
  'database',
  'loop-assistant',
  'codex-assistant',
  'terminal',
  'diff',
  'git',
  'code',
  'review-queue',
] as const;

export type RepoPanelId = (typeof REPO_PANEL_IDS)[number];

export type RepoWorkspacePanelSpec = {
  id: RepoPanelId;
  label: string;
  key: string;
  rail: RepoPanelRail;
};

export type RepoWorkspaceLayoutDefinition = {
  workspaceId: RepoWorkspaceId;
  label: string;
  layoutId: string;
  mainAnchorPanelId: RepoPanelId;
  mainPanelIds: RepoPanelId[];
  panelSpecs: RepoWorkspacePanelSpec[];
};

const PANEL_LABELS: Record<RepoPanelId, string> = {
  'loop-cadence': 'Loop Cadence',
  planning: 'Planning',
  env: 'Env',
  commands: 'Commands',
  story: 'Story',
  docs: 'Docs',
  'loop-assistant': 'Loop Assistant',
  'codex-assistant': 'Codex Assistant',
  terminal: 'Terminal',
  diff: 'Diff',
  git: 'Git',
  code: 'Code',
  'review-queue': 'Review Queue',
  database: 'Database',
};

export const REPO_WORKSPACE_LABELS: Record<RepoWorkspaceId, string> = {
  planning: 'Planning',
  env: 'Env',
  commands: 'Commands',
  story: 'Story',
  docs: 'Docs',
  git: 'Git',
  'loop-assistant': 'Loop Assistant',
  'codex-assistant': 'Codex Assistant',
  diff: 'Diff',
  code: 'Code',
  'review-queue': 'Review Queue',
  database: 'Database',
};

function panelKey(panelId: RepoPanelId) {
  return `panel.visible.repo-${panelId}`;
}

function createPanelSpec(id: RepoPanelId, rail: RepoPanelRail): RepoWorkspacePanelSpec {
  return {
    id,
    rail,
    label: PANEL_LABELS[id],
    key: panelKey(id),
  };
}

function createLayoutId(workspaceId: RepoWorkspaceId) {
  return `repo-${workspaceId}`;
}

const LAYOUT_DEFINITIONS: Record<RepoWorkspaceId, RepoWorkspaceLayoutDefinition> = {
  planning: {
    workspaceId: 'planning',
    label: REPO_WORKSPACE_LABELS.planning,
    layoutId: createLayoutId('planning'),
    mainAnchorPanelId: 'planning',
    mainPanelIds: ['planning'],
    panelSpecs: [
      createPanelSpec('loop-cadence', 'left'),
      createPanelSpec('planning', 'main'),
      createPanelSpec('loop-assistant', 'right'),
    ],
  },
  env: {
    workspaceId: 'env',
    label: REPO_WORKSPACE_LABELS.env,
    layoutId: createLayoutId('env'),
    mainAnchorPanelId: 'planning',
    mainPanelIds: ['planning'],
    panelSpecs: [
      createPanelSpec('planning', 'main'),
      createPanelSpec('env', 'right'),
    ],
  },
  commands: {
    workspaceId: 'commands',
    label: REPO_WORKSPACE_LABELS.commands,
    layoutId: createLayoutId('commands'),
    mainAnchorPanelId: 'commands',
    mainPanelIds: ['commands'],
    panelSpecs: [
      createPanelSpec('loop-cadence', 'left'),
      createPanelSpec('commands', 'main'),
      createPanelSpec('terminal', 'bottom'),
    ],
  },
  story: {
    workspaceId: 'story',
    label: REPO_WORKSPACE_LABELS.story,
    layoutId: createLayoutId('story'),
    mainAnchorPanelId: 'story',
    mainPanelIds: ['story'],
    panelSpecs: [
      createPanelSpec('story', 'main'),
      createPanelSpec('loop-assistant', 'right'),
      createPanelSpec('docs', 'bottom'),
    ],
  },
  docs: {
    workspaceId: 'docs',
    label: REPO_WORKSPACE_LABELS.docs,
    layoutId: createLayoutId('docs'),
    mainAnchorPanelId: 'planning',
    mainPanelIds: ['planning', 'docs'],
    panelSpecs: [
      createPanelSpec('planning', 'main'),
      createPanelSpec('docs', 'main'),
    ],
  },
  git: {
    workspaceId: 'git',
    label: REPO_WORKSPACE_LABELS.git,
    layoutId: createLayoutId('git'),
    mainAnchorPanelId: 'code',
    mainPanelIds: ['code', 'git'],
    panelSpecs: [
      createPanelSpec('code', 'main'),
      createPanelSpec('git', 'main'),
      createPanelSpec('diff', 'bottom'),
    ],
  },
  'loop-assistant': {
    workspaceId: 'loop-assistant',
    label: REPO_WORKSPACE_LABELS['loop-assistant'],
    layoutId: createLayoutId('loop-assistant'),
    mainAnchorPanelId: 'planning',
    mainPanelIds: ['planning', 'loop-assistant'],
    panelSpecs: [
      createPanelSpec('planning', 'main'),
      createPanelSpec('loop-assistant', 'main'),
    ],
  },
  'codex-assistant': {
    workspaceId: 'codex-assistant',
    label: REPO_WORKSPACE_LABELS['codex-assistant'],
    layoutId: createLayoutId('codex-assistant'),
    mainAnchorPanelId: 'code',
    mainPanelIds: ['code', 'codex-assistant'],
    panelSpecs: [
      createPanelSpec('code', 'main'),
      createPanelSpec('codex-assistant', 'main'),
      createPanelSpec('review-queue', 'bottom'),
    ],
  },
  diff: {
    workspaceId: 'diff',
    label: REPO_WORKSPACE_LABELS.diff,
    layoutId: createLayoutId('diff'),
    mainAnchorPanelId: 'code',
    mainPanelIds: ['code', 'diff'],
    panelSpecs: [
      createPanelSpec('code', 'main'),
      createPanelSpec('diff', 'main'),
      createPanelSpec('git', 'bottom'),
    ],
  },
  code: {
    workspaceId: 'code',
    label: REPO_WORKSPACE_LABELS.code,
    layoutId: createLayoutId('code'),
    mainAnchorPanelId: 'code',
    mainPanelIds: ['code'],
    panelSpecs: [
      createPanelSpec('code', 'main'),
      createPanelSpec('codex-assistant', 'right'),
      createPanelSpec('diff', 'bottom'),
      createPanelSpec('git', 'bottom'),
    ],
  },
  'review-queue': {
    workspaceId: 'review-queue',
    label: REPO_WORKSPACE_LABELS['review-queue'],
    layoutId: createLayoutId('review-queue'),
    mainAnchorPanelId: 'code',
    mainPanelIds: ['code', 'review-queue'],
    panelSpecs: [
      createPanelSpec('code', 'main'),
      createPanelSpec('review-queue', 'main'),
      createPanelSpec('codex-assistant', 'right'),
      createPanelSpec('diff', 'bottom'),
    ],
  },
  database: {
    workspaceId: 'database',
    label: REPO_WORKSPACE_LABELS.database,
    layoutId: createLayoutId('database'),
    mainAnchorPanelId: 'database',
    mainPanelIds: ['database'],
    panelSpecs: [createPanelSpec('database', 'main')],
  },
};

export function getWorkspaceLayoutDefinition(workspaceId: RepoWorkspaceId): RepoWorkspaceLayoutDefinition {
  return LAYOUT_DEFINITIONS[workspaceId];
}

export function getWorkspaceLayoutId(workspaceId: RepoWorkspaceId): string {
  return getWorkspaceLayoutDefinition(workspaceId).layoutId;
}

export function getWorkspacePanelSpecs(workspaceId: RepoWorkspaceId): RepoWorkspacePanelSpec[] {
  return getWorkspaceLayoutDefinition(workspaceId).panelSpecs;
}

function normalizePanelIds(panelIds: unknown[]) {
  return [...new Set(
    (panelIds || [])
      .map((panelId) => String(panelId || '').trim())
      .filter(Boolean),
  )];
}

export function sanitizeWorkspaceHiddenPanelIds(
  workspaceId: RepoWorkspaceId,
  panelIds: unknown[],
): string[] {
  const definition = getWorkspaceLayoutDefinition(workspaceId);
  const allowedIds = new Set(definition.panelSpecs.map((panel) => panel.id));
  const hidden = normalizePanelIds(panelIds).filter((panelId) => allowedIds.has(panelId as RepoPanelId));
  const hiddenSet = new Set(hidden);
  const visibleMainPanels = definition.mainPanelIds.filter((panelId) => !hiddenSet.has(panelId));
  if (visibleMainPanels.length === 0) {
    hiddenSet.delete(definition.mainAnchorPanelId);
    const fallbackVisibleMainPanels = definition.mainPanelIds.filter((panelId) => !hiddenSet.has(panelId));
    if (fallbackVisibleMainPanels.length === 0 && definition.mainPanelIds[0]) {
      hiddenSet.delete(definition.mainPanelIds[0]);
    }
  }
  return [...hiddenSet].sort((a, b) => a.localeCompare(b));
}

export function createEmptyWorkspaceHiddenPanelMap(): Partial<Record<RepoWorkspaceId, string[]>> {
  return REPO_WORKSPACE_IDS.reduce((acc, workspaceId) => {
    acc[workspaceId] = [];
    return acc;
  }, {} as Partial<Record<RepoWorkspaceId, string[]>>);
}


export type RepoEditorPanelSpec = {
  id: string;
  label: string;
  key: string;
  rail: 'left' | 'main' | 'right' | 'bottom';
};

export const REPO_EDITOR_PANEL_SPECS: RepoEditorPanelSpec[] = [
  {
    id: 'loop-cadence',
    label: 'Loop Cadence',
    key: 'panel.visible.repo-loop-cadence',
    rail: 'left',
  },
  {
    id: 'planning',
    label: 'Planning',
    key: 'panel.visible.repo-planning',
    rail: 'main',
  },
  {
    id: 'commands',
    label: 'Commands',
    key: 'panel.visible.repo-commands',
    rail: 'main',
  },
  {
    id: 'env',
    label: 'Env',
    key: 'panel.visible.repo-env',
    rail: 'right',
  },
  {
    id: 'loop-assistant',
    label: 'Loop Assistant',
    key: 'panel.visible.repo-loop-assistant',
    rail: 'right',
  },
  {
    id: 'codex-assistant',
    label: 'Codex Assistant',
    key: 'panel.visible.repo-codex-assistant',
    rail: 'right',
  },
  {
    id: 'docs',
    label: 'Docs',
    key: 'panel.visible.repo-docs',
    rail: 'bottom',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    key: 'panel.visible.repo-terminal',
    rail: 'bottom',
  },
  {
    id: 'diff',
    label: 'Diff',
    key: 'panel.visible.repo-diff',
    rail: 'bottom',
  },
];

const PANEL_ID_BY_KEY = new Map(REPO_EDITOR_PANEL_SPECS.map((spec) => [spec.key, spec.id]));

export function panelIdFromVisibilityKey(key: string) {
  return PANEL_ID_BY_KEY.get(String(key || '').trim()) || null;
}

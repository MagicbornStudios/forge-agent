import {
  createEditorMenubarMenus,
  EditorHelpMenu,
  type CreateEditorMenubarMenusOptions,
  type EditorMenubarItem,
  type EditorMenubarMenu,
} from '@forge/shared/components/editor';
import { REPO_WORKSPACE_IDS, type RepoWorkspaceId } from '@/lib/types';
import { REPO_WORKSPACE_LABELS } from './workspace-layout-definitions';

type RepoMenuContext = {
  workspaceId: RepoWorkspaceId;
  openWorkspaceIds: RepoWorkspaceId[];
  nextAction: string;
  onRefreshSnapshot: () => void;
  onRunEnvDoctor: () => void;
  onRunEnvReconcile: () => void;
  onFocusWorkspace: (workspaceId: RepoWorkspaceId, panelId?: string) => void;
  onOpenWorkspace: (workspaceId: RepoWorkspaceId) => void;
  onCopyText: (text: string) => void;
  layoutViewItems: EditorMenubarItem[];
};

type RepoWorkspaceMenuFactory = (context: RepoMenuContext) => Partial<CreateEditorMenubarMenusOptions>;

function focusItem(
  id: string,
  label: string,
  context: RepoMenuContext,
  workspaceId: RepoWorkspaceId,
  panelId?: string,
): EditorMenubarItem {
  return {
    id,
    label,
    onSelect: () => context.onFocusWorkspace(workspaceId, panelId),
  };
}

const REPO_WORKSPACE_MENU_FACTORIES: Partial<Record<RepoWorkspaceId, RepoWorkspaceMenuFactory>> = {
  planning: (context) => ({
    file: [
      {
        id: 'file-refresh-loop-snapshot',
        label: 'Refresh Loop Snapshot',
        onSelect: context.onRefreshSnapshot,
      },
      {
        id: 'file-copy-next-action',
        label: 'Copy Next Loop Command',
        onSelect: () => context.onCopyText(context.nextAction),
      },
    ],
    view: [
      focusItem('view-focus-loop-assistant', 'Focus Loop Assistant', context, 'loop-assistant', 'loop-assistant'),
      focusItem('view-focus-commands', 'Focus Commands', context, 'commands', 'commands'),
    ],
  }),
  env: (context) => ({
    file: [
      {
        id: 'file-env-doctor',
        label: 'Run Env Doctor',
        onSelect: context.onRunEnvDoctor,
      },
      {
        id: 'file-env-reconcile',
        label: 'Run Env Reconcile',
        onSelect: context.onRunEnvReconcile,
      },
    ],
    view: [
      focusItem('view-focus-env-panel', 'Focus Env Panel', context, 'env', 'env'),
      focusItem('view-focus-planning-panel', 'Focus Planning Panel', context, 'planning', 'planning'),
    ],
  }),
  commands: (context) => ({
    view: [
      focusItem('view-focus-terminal-panel', 'Focus Terminal Panel', context, 'commands', 'terminal'),
      focusItem('view-focus-review-queue-panel', 'Focus Review Queue', context, 'review-queue', 'review-queue'),
    ],
  }),
  code: (context) => ({
    view: [
      focusItem('view-focus-code-panel', 'Focus Code Panel', context, 'code', 'code'),
      focusItem('view-focus-diff-panel', 'Focus Diff Panel', context, 'diff', 'diff'),
      focusItem('view-focus-git-panel', 'Focus Git Panel', context, 'git', 'git'),
    ],
  }),
  story: (context) => ({
    view: [
      focusItem('view-focus-story-panel', 'Focus Story Panel', context, 'story', 'story'),
      focusItem('view-focus-codex-assistant', 'Focus Codex Assistant', context, 'codex-assistant', 'codex-assistant'),
    ],
  }),
  docs: (context) => ({
    view: [
      focusItem('view-focus-docs-panel', 'Focus Docs Panel', context, 'docs', 'docs'),
      focusItem('view-focus-planning-panel', 'Focus Planning Panel', context, 'planning', 'planning'),
    ],
  }),
  database: (context) => ({
    view: [
      focusItem('view-focus-database-panel', 'Focus Database', context, 'database', 'database'),
    ],
  }),
  git: (context) => ({
    view: [
      focusItem('view-focus-git-panel', 'Focus Git Panel', context, 'git', 'git'),
      focusItem('view-focus-diff-panel', 'Focus Diff Panel', context, 'diff', 'diff'),
    ],
  }),
  diff: (context) => ({
    view: [
      focusItem('view-focus-diff-panel', 'Focus Diff Panel', context, 'diff', 'diff'),
      focusItem('view-focus-review-queue-panel', 'Focus Review Queue', context, 'review-queue', 'review-queue'),
    ],
  }),
  'loop-assistant': (context) => ({
    view: [
      focusItem('view-focus-loop-assistant', 'Focus Loop Assistant', context, 'loop-assistant', 'loop-assistant'),
      focusItem('view-focus-planning-panel', 'Focus Planning Panel', context, 'planning', 'planning'),
    ],
  }),
  'codex-assistant': (context) => ({
    view: [
      focusItem('view-focus-codex-assistant', 'Focus Codex Assistant', context, 'codex-assistant', 'codex-assistant'),
      focusItem('view-focus-review-queue-panel', 'Focus Review Queue', context, 'review-queue', 'review-queue'),
    ],
  }),
  'review-queue': (context) => ({
    view: [
      focusItem('view-focus-review-queue-panel', 'Focus Review Queue', context, 'review-queue', 'review-queue'),
      focusItem('view-focus-diff-panel', 'Focus Diff Panel', context, 'diff', 'diff'),
    ],
  }),
};

function buildWorkspaceSubmenu(context: RepoMenuContext): EditorMenubarItem[] {
  return REPO_WORKSPACE_IDS.map((workspaceId) => {
    const isOpen = context.openWorkspaceIds.includes(workspaceId);
    return {
      id: `workspace-${workspaceId}`,
      label: `${isOpen ? 'Focus' : 'Open'} ${REPO_WORKSPACE_LABELS[workspaceId]}`,
      onSelect: () => context.onOpenWorkspace(workspaceId),
    };
  });
}

export function buildRepoWorkspaceMenus(context: RepoMenuContext): EditorMenubarMenu[] {
  const factory = REPO_WORKSPACE_MENU_FACTORIES[context.workspaceId];
  const contribution = factory ? factory(context) : {};

  return createEditorMenubarMenus({
    file: [
      {
        id: 'file-workspaces',
        label: 'Workspaces',
        submenu: buildWorkspaceSubmenu(context),
      },
      { id: 'file-sep-workspaces', type: 'separator' },
      {
        id: 'file-refresh-workspace',
        label: 'Refresh Workspace Snapshot',
        onSelect: context.onRefreshSnapshot,
      },
      ...(contribution.file || []),
    ],
    view: [
      ...(contribution.view || []),
      { id: 'view-sep-layout', type: 'separator' },
      ...context.layoutViewItems,
    ],
    edit: contribution.edit || [],
    settings: contribution.settings || [],
    help: [
      EditorHelpMenu.Welcome(),
      EditorHelpMenu.ShowCommands(),
      EditorHelpMenu.About(),
      ...(contribution.help || []),
    ],
    extra: contribution.extra || [],
  });
}

import {
  createWorkspaceMenubarMenus,
  WorkspaceHelpMenu,
  type CreateWorkspaceMenubarMenusOptions,
  type WorkspaceMenubarItem,
  type WorkspaceMenubarMenu,
} from '@forge/shared/components/workspace';
import { REPO_WORKSPACE_IDS, type RepoWorkspaceId } from '@/lib/types';
import {
  getWorkspacePanelSpecs,
  WORKSPACE_LABELS,
} from '../app-spec.generated';

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
  layoutViewItems: WorkspaceMenubarItem[];
};

type RepoWorkspaceMenuFactory = (context: RepoMenuContext) => Partial<CreateWorkspaceMenubarMenusOptions> & {
  viewExtras?: WorkspaceMenubarItem[];
};

function focusItem(
  id: string,
  label: string,
  context: RepoMenuContext,
  workspaceId: RepoWorkspaceId,
  panelId?: string,
): WorkspaceMenubarItem {
  return {
    id,
    label,
    onSelect: () => context.onFocusWorkspace(workspaceId, panelId),
  };
}

/** Per-workspace file and optional view extras (non-panel items). Focus items come from getWorkspacePanelSpecs. */
const REPO_WORKSPACE_MENU_FACTORIES: Partial<Record<RepoWorkspaceId, RepoWorkspaceMenuFactory>> = {
  planning: (context) => ({
    file: [
      { id: 'file-refresh-loop-snapshot', label: 'Refresh Loop Snapshot', onSelect: context.onRefreshSnapshot },
      { id: 'file-copy-next-action', label: 'Copy Next Loop Command', onSelect: () => context.onCopyText(context.nextAction) },
    ],
    viewExtras: [
      focusItem('view-focus-commands', 'Focus Commands', context, 'commands', 'commands'),
    ],
  }),
  env: (context) => ({
    file: [
      { id: 'file-env-doctor', label: 'Run Env Doctor', onSelect: context.onRunEnvDoctor },
      { id: 'file-env-reconcile', label: 'Run Env Reconcile', onSelect: context.onRunEnvReconcile },
    ],
  }),
  commands: (context) => ({
    viewExtras: [
      focusItem('view-focus-review-queue', 'Focus Review Queue', context, 'review-queue', 'review-queue'),
    ],
  }),
  code: (context) => ({
    viewExtras: [
      focusItem('view-focus-assistant-ws', 'Focus Assistant', context, 'assistant', 'assistant'),
      focusItem('view-focus-diff-ws', 'Focus Diff', context, 'diff', 'diff'),
      focusItem('view-focus-git-ws', 'Focus Git', context, 'git', 'git'),
    ],
  }),
  story: (context) => ({
    viewExtras: [
      focusItem('view-focus-assistant-ws', 'Focus Assistant', context, 'assistant', 'assistant'),
    ],
  }),
  git: (context) => ({
    viewExtras: [
      focusItem('view-focus-diff-ws', 'Focus Diff', context, 'diff', 'diff'),
    ],
  }),
  diff: (context) => ({
    viewExtras: [
      focusItem('view-focus-review-queue-ws', 'Focus Review Queue', context, 'review-queue', 'review-queue'),
    ],
  }),
  assistant: (context) => ({
    viewExtras: [
      focusItem('view-focus-planning-ws', 'Focus Planning', context, 'planning', 'planning'),
    ],
  }),
};

function buildWorkspaceSubmenu(context: RepoMenuContext): WorkspaceMenubarItem[] {
  return REPO_WORKSPACE_IDS.map((workspaceId) => {
    const isOpen = context.openWorkspaceIds.includes(workspaceId);
    return {
      id: `workspace-${workspaceId}`,
      label: `${isOpen ? 'Focus' : 'Open'} ${WORKSPACE_LABELS[workspaceId]}`,
      onSelect: () => context.onOpenWorkspace(workspaceId),
    };
  });
}

export function buildRepoWorkspaceMenus(context: RepoMenuContext): WorkspaceMenubarMenu[] {
  const factory = REPO_WORKSPACE_MENU_FACTORIES[context.workspaceId];
  const contribution = factory ? factory(context) : {};
  const focusItems = getWorkspacePanelSpecs(context.workspaceId).map((spec) =>
    focusItem(`view-focus-${spec.id}`, `Focus ${spec.label}`, context, context.workspaceId, spec.id),
  );

  return createWorkspaceMenubarMenus({
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
      ...focusItems,
      ...(contribution.viewExtras || []),
      { id: 'view-sep-layout', type: 'separator' },
      ...context.layoutViewItems,
    ],
    edit: contribution.edit || [],
    settings: contribution.settings || [],
    help: [
      WorkspaceHelpMenu.Welcome(),
      WorkspaceHelpMenu.ShowCommands(),
      WorkspaceHelpMenu.About(),
      ...(contribution.help || []),
    ],
    extra: contribution.extra || [],
  });
}

import {
  createWorkspaceMenubarMenus,
  WorkspaceHelpMenu,
  type CreateWorkspaceMenubarMenusOptions,
  type WorkspaceMenubarItem,
  type WorkspaceMenubarMenu,
} from '@forge/shared/components/workspace';
import type { RepoProject } from '@/lib/api/types';

export type RepoWorkspaceMenuDescriptor = {
  id: string;
  label: string;
};

type RepoMenuContext = {
  workspaceId: string;
  openWorkspaceIds: string[];
  availableWorkspaces: RepoWorkspaceMenuDescriptor[];
  focusPanelSpecs: Array<{ id: string; label: string }>;
  assistantPanelVisible: boolean;
  nextAction: string;
  onRefreshSnapshot: () => void;
  onRunEnvDoctor: () => void;
  onRunEnvReconcile: () => void;
  onFocusWorkspace: (workspaceId: string, panelId?: string) => void;
  onOpenWorkspace: (workspaceId: string) => void;
  onFocusAssistantPanel: () => void;
  onToggleAssistantPanel: () => void;
  onOpenProjectFolder: () => void;
  onSwitchProject: (projectId: string) => void;
  onPushToGitHub: () => void;
  onNewTerminal: () => void;
  onLaunchCodexCli: () => void;
  onLaunchClaudeCli: () => void;
  onCopyText: (text: string) => void;
  projects: RepoProject[];
  activeProjectId: string;
  canPushToGitHub: boolean;
  pushToGitHubLabel: string;
  layoutViewItems: WorkspaceMenubarItem[];
};

type RepoWorkspaceMenuFactory = (context: RepoMenuContext) => Partial<CreateWorkspaceMenubarMenusOptions> & {
  viewExtras?: WorkspaceMenubarItem[];
};

function focusItem(
  id: string,
  label: string,
  context: RepoMenuContext,
  workspaceId: string,
  panelId?: string,
): WorkspaceMenubarItem {
  return {
    id,
    label,
    onSelect: () => context.onFocusWorkspace(workspaceId, panelId),
  };
}

/** Per-workspace file and optional view extras (non-panel items). Focus items come from runtime panel specs. */
const REPO_WORKSPACE_MENU_FACTORIES: Record<string, RepoWorkspaceMenuFactory> = {
  planning: (context) => ({
    file: [
      { id: 'file-refresh-loop-snapshot', label: 'Refresh Loop Snapshot', onSelect: context.onRefreshSnapshot },
      { id: 'file-copy-next-action', label: 'Copy Next Loop Command', onSelect: () => context.onCopyText(context.nextAction) },
    ],
  }),
  env: (context) => ({
    file: [
      { id: 'file-env-doctor', label: 'Run Env Doctor', onSelect: context.onRunEnvDoctor },
      { id: 'file-env-reconcile', label: 'Run Env Reconcile', onSelect: context.onRunEnvReconcile },
    ],
  }),
  'env-workspace': (context) => ({
    file: [
      { id: 'file-env-doctor', label: 'Run Env Doctor', onSelect: context.onRunEnvDoctor },
      { id: 'file-env-reconcile', label: 'Run Env Reconcile', onSelect: context.onRunEnvReconcile },
    ],
  }),
};

function buildWorkspaceSubmenu(context: RepoMenuContext): WorkspaceMenubarItem[] {
  return context.availableWorkspaces.map((workspace) => {
    const isOpen = context.openWorkspaceIds.includes(workspace.id);
    return {
      id: `workspace-${workspace.id}`,
      label: `${isOpen ? 'Focus' : 'Open'} ${workspace.label}`,
      onSelect: () => context.onOpenWorkspace(workspace.id),
    };
  });
}

function buildRecentProjectsSubmenu(context: RepoMenuContext): WorkspaceMenubarItem[] {
  if (!Array.isArray(context.projects) || context.projects.length === 0) {
    return [
      {
        id: 'project-none',
        label: 'No projects found',
        disabled: true,
      },
    ];
  }

  return context.projects.map((project) => {
    const isActive = project.projectId === context.activeProjectId;
    const projectLabel = isActive ? `* ${project.name}` : project.name;
    return {
      id: `project-${project.projectId}`,
      label: projectLabel,
      disabled: isActive,
      onSelect: () => context.onSwitchProject(project.projectId),
    };
  });
}

export function buildRepoWorkspaceMenus(context: RepoMenuContext): WorkspaceMenubarMenu[] {
  const factory = REPO_WORKSPACE_MENU_FACTORIES[context.workspaceId];
  const contribution = factory ? factory(context) : {};
  const focusItems = context.focusPanelSpecs.map((spec) =>
    focusItem(`view-focus-${spec.id}`, `Focus ${spec.label}`, context, context.workspaceId, spec.id),
  );

  return createWorkspaceMenubarMenus({
    file: [
      {
        id: 'file-open-project-folder',
        label: 'Open Project Folder...',
        onSelect: context.onOpenProjectFolder,
      },
      {
        id: 'file-recent-projects',
        label: 'Recent Projects',
        submenu: buildRecentProjectsSubmenu(context),
      },
      {
        id: 'file-push-github',
        label: context.pushToGitHubLabel,
        disabled: !context.canPushToGitHub,
        onSelect: context.onPushToGitHub,
      },
      { id: 'file-sep-terminal', type: 'separator' },
      {
        id: 'file-new-terminal',
        label: 'New Terminal',
        onSelect: context.onNewTerminal,
      },
      {
        id: 'file-launch-codex-cli',
        label: 'Launch Codex CLI',
        onSelect: context.onLaunchCodexCli,
      },
      {
        id: 'file-launch-claude-cli',
        label: 'Launch Claude Code CLI',
        onSelect: context.onLaunchClaudeCli,
      },
      { id: 'file-sep-projects', type: 'separator' },
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
      {
        id: 'view-focus-assistant-panel',
        label: 'Focus Assistant panel',
        onSelect: context.onFocusAssistantPanel,
      },
      {
        id: 'view-toggle-assistant-panel',
        label: context.assistantPanelVisible ? 'Hide Assistant panel (global)' : 'Show Assistant panel (global)',
        onSelect: context.onToggleAssistantPanel,
      },
      { id: 'view-sep-assistant', type: 'separator' },
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

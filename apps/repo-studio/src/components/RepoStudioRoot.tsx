'use client';

import * as React from 'react';
import { FolderOpen, FolderTree, Github, LayoutPanelTop, Loader2, X } from 'lucide-react';
import { StudioApp } from '@forge/shared/components/app';
import { WorkspaceMenubar } from '@forge/shared/components/workspace';
import { Button } from '@forge/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@forge/ui/dialog';
import { Input } from '@forge/ui/input';
import { Label } from '@forge/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@forge/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@forge/ui/tabs';
import { toErrorMessage } from '@/lib/api/http';
import {
  browseRepoProjectDirectories,
  cloneRepoProject,
  fetchGitHubStatus,
  fetchCommandsModel,
  fetchRepoProjects,
  fetchRepoWorkspaceExtensionRegistry,
  fetchSettingsSnapshot,
  fetchRepoWorkspaceExtensions,
  importLocalRepoProject,
  pushGit,
  saveCommandView,
  setActiveRepoProject,
  startGitHubDeviceLogin,
  stopRuntime,
  toggleCommandPolicy,
  upsertSettings,
} from '@/lib/api/services';
import type {
  EnvDoctorPayload,
  GitHubAuthStatusResponse,
  RepoMode,
  RepoProject,
  RepoProjectBrowseEntry,
  RepoWorkspaceExtension,
} from '@/lib/api/types';
import type { PlanningSnapshot, RepoCommandEntry, RepoLoopsSnapshot } from '@/lib/repo-data';
import type { RepoCommandView, RepoWorkspaceId } from '@/lib/types';
import { getDesktopRuntimeBridge } from '@/lib/desktop-runtime';
import { buildRepoWorkspaceMenus } from '@/lib/app-shell/menu-contributions';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';
import { RepoStudioProvider } from '@/lib/app-shell/RepoStudioContext';
import { createRepoWorkspaceCatalog, getWorkspaceCatalogEntry } from '@/lib/workspace-catalog';
import { useCommandFilters } from '@/components/hooks/useCommandFilters';
import { useCommandOutput } from '@/components/hooks/useCommandOutput';
import { useCommandRuns } from '@/components/hooks/useCommandRuns';
import { useEnvDoctor } from '@/components/hooks/useEnvDoctor';
import { usePlatformAuth } from '@/components/hooks/usePlatformAuth';
import { usePlanningSync } from '@/components/hooks/usePlanningSync';
import { RepoCodexControls } from '@/components/appbar/RepoCodexControls';
import { GlobalTerminalDock, type TerminalLaunchRequest } from '@/components/features/terminal/GlobalTerminalDock';
import { RepoSettingsPanelContent } from '@/components/settings/RepoSettingsPanelContent';
import type { RepoStudioPanelContext } from '@/components/workspaces';
import { isPinnedPanelId } from '@/components/workspaces/types';

function copyText(text: string) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {});
}

function getAssistantPrompts(merged: Record<string, unknown>, loopId: string) {
  const assistant = merged.assistant && typeof merged.assistant === 'object'
    ? merged.assistant as Record<string, unknown>
    : {};
  const prompts = assistant.prompts && typeof assistant.prompts === 'object'
    ? assistant.prompts as Record<string, unknown>
    : {};
  const byLoop = prompts.byLoop && typeof prompts.byLoop === 'object'
    ? prompts.byLoop as Record<string, unknown>
    : {};
  const perLoop = byLoop[loopId] && typeof byLoop[loopId] === 'object'
    ? byLoop[loopId] as Record<string, unknown>
    : (byLoop.default && typeof byLoop.default === 'object'
      ? byLoop.default as Record<string, unknown>
      : {});
  return {
    forgeAssistant: String(perLoop.forgeAssistant || '').trim(),
    codexAssistant: String(perLoop.codexAssistant || '').trim(),
  };
}

type OpenProjectDialogTab = 'local' | 'github';
const EXTENSION_REFRESH_EVENT = 'repo-studio:refresh-extensions';

function dedupeMessages(values: string[]) {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const value of values) {
    const normalized = String(value || '').trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    next.push(normalized);
  }
  return next;
}

export function RepoStudioRoot({
  commands,
  planning,
  loops,
}: {
  commands: RepoCommandEntry[];
  planning: PlanningSnapshot;
  loops: RepoLoopsSnapshot;
}) {
  const [layoutResetCounter, setLayoutResetCounter] = React.useState(0);
  const [profile, setProfile] = React.useState('forge-agent');
  const [mode, setMode] = React.useState<RepoMode>('local');
  const [reviewQueueTrustMode, setReviewQueueTrustMode] = React.useState<'require-approval' | 'auto-approve-all'>('require-approval');
  const [reviewQueueLastAutoApplyAt, setReviewQueueLastAutoApplyAt] = React.useState('');
  const [forgeAssistantPrompt, setForgeAssistantPrompt] = React.useState('');
  const [codexAssistantPrompt, setCodexAssistantPrompt] = React.useState('');
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(planning.docs[0]?.id || null);
  const [projects, setProjects] = React.useState<RepoProject[]>([]);
  const [activeProjectId, setActiveProjectId] = React.useState('');
  const [githubStatus, setGitHubStatus] = React.useState<GitHubAuthStatusResponse | null>(null);
  const [openProjectDialogOpen, setOpenProjectDialogOpen] = React.useState(false);
  const [openProjectPath, setOpenProjectPath] = React.useState('');
  const [openProjectDialogTab, setOpenProjectDialogTab] = React.useState<OpenProjectDialogTab>('local');
  const [browseCwd, setBrowseCwd] = React.useState('');
  const [browseParent, setBrowseParent] = React.useState<string | null>(null);
  const [browseRoots, setBrowseRoots] = React.useState<string[]>([]);
  const [browseEntries, setBrowseEntries] = React.useState<RepoProjectBrowseEntry[]>([]);
  const [browseBusy, setBrowseBusy] = React.useState(false);
  const [cloneRemoteUrl, setCloneRemoteUrl] = React.useState('');
  const [cloneTargetPath, setCloneTargetPath] = React.useState('');
  const [githubAuthBusy, setGithubAuthBusy] = React.useState(false);
  const [showAdvancedPathInput, setShowAdvancedPathInput] = React.useState(false);
  const [projectActionBusy, setProjectActionBusy] = React.useState(false);
  const [workspaceExtensions, setWorkspaceExtensions] = React.useState<RepoWorkspaceExtension[]>([]);
  const [workspaceExtensionWarnings, setWorkspaceExtensionWarnings] = React.useState<string[]>([]);
  const [extensionRegistryWarnings, setExtensionRegistryWarnings] = React.useState<string[]>([]);
  const [workspaceCatalogReady, setWorkspaceCatalogReady] = React.useState(false);
  const [terminalOpen, setTerminalOpen] = React.useState(false);
  const [terminalLaunchRequest, setTerminalLaunchRequest] = React.useState<TerminalLaunchRequest | null>(null);
  const terminalLaunchCounterRef = React.useRef(0);

  const activeWorkspaceId = useRepoStudioShellStore((state) => state.route.activeWorkspaceId);
  const openWorkspaceIds = useRepoStudioShellStore((state) => state.route.openWorkspaceIds);
  const dockLayouts = useRepoStudioShellStore((state) => state.dockLayouts);
  const workspaceHiddenPanelIds = useRepoStudioShellStore((state) => state.workspaceHiddenPanelIds);
  const openWorkspace = useRepoStudioShellStore((state) => state.openWorkspace);
  const closeWorkspace = useRepoStudioShellStore((state) => state.closeWorkspace);
  const setPanelVisibleForWorkspace = useRepoStudioShellStore((state) => state.setPanelVisibleForWorkspace);
  const restoreWorkspacePanels = useRepoStudioShellStore((state) => state.restoreWorkspacePanels);
  const settingsSidebarOpen = useRepoStudioShellStore((state) => state.settingsSidebarOpen);
  const setSettingsSidebarOpen = useRepoStudioShellStore((state) => state.setSettingsSidebarOpen);
  const setDockLayout = useRepoStudioShellStore((state) => state.setDockLayout);
  const clearDockLayout = useRepoStudioShellStore((state) => state.clearDockLayout);
  const replaceCommandView = useRepoStudioShellStore((state) => state.replaceCommandView);
  const replaceHiddenPanelIds = useRepoStudioShellStore((state) => state.replaceHiddenPanelIds);
  const replaceWorkspaceHiddenPanelIds = useRepoStudioShellStore((state) => state.replaceWorkspaceHiddenPanelIds);
  const activeLoopId = useRepoStudioShellStore((state) => state.activeLoopId);
  const setActiveLoopId = useRepoStudioShellStore((state) => state.setActiveLoopId);
  const setActiveWorkspace = useRepoStudioShellStore((state) => state.setActiveWorkspace);
  const setOpenWorkspaceIds = useRepoStudioShellStore((state) => state.setOpenWorkspaceIds);
  const setPanelVisibleAcrossWorkspaces = useRepoStudioShellStore((state) => state.setPanelVisibleAcrossWorkspaces);

  const workspaceCatalog = React.useMemo(
    () => createRepoWorkspaceCatalog(workspaceExtensions),
    [workspaceExtensions],
  );
  const workspaceEntries = workspaceCatalog.entries;
  const workspaceLabels = workspaceCatalog.labels;
  const workspaceExtensionMap = React.useMemo(
    () => workspaceExtensions.reduce((acc, extension) => {
      acc[extension.workspaceId] = extension;
      return acc;
    }, {} as Record<string, RepoWorkspaceExtension>),
    [workspaceExtensions],
  );
  const availableWorkspaceIds = React.useMemo(
    () => workspaceCatalog.ids,
    [workspaceCatalog.ids],
  );
  const installedEnvWorkspaceId = React.useMemo(() => {
    const explicit = workspaceExtensions.find((extension) => extension.workspaceId === 'env-workspace');
    if (explicit?.workspaceId) return explicit.workspaceId;
    const byKind = workspaceExtensions.find((extension) => extension.workspaceKind === 'env');
    return byKind?.workspaceId || null;
  }, [workspaceExtensions]);
  const resolveWorkspaceAlias = React.useCallback((workspaceId: string): RepoWorkspaceId => {
    const normalized = String(workspaceId || '').trim();
    if (normalized !== 'env') return normalized as RepoWorkspaceId;
    if (installedEnvWorkspaceId) return installedEnvWorkspaceId as RepoWorkspaceId;
    return 'planning' as RepoWorkspaceId;
  }, [installedEnvWorkspaceId]);
  const effectiveWorkspaceEntry = React.useMemo(
    () => getWorkspaceCatalogEntry(workspaceCatalog, activeWorkspaceId),
    [activeWorkspaceId, workspaceCatalog],
  );
  const effectiveWorkspaceId: RepoWorkspaceId = effectiveWorkspaceEntry.id;

  const activeLayoutId = effectiveWorkspaceEntry.layoutId;
  const activeLayoutJson = dockLayouts[activeLayoutId] || null;
  const activeHiddenPanelIds = React.useMemo(
    () => workspaceHiddenPanelIds[effectiveWorkspaceId] || [],
    [effectiveWorkspaceId, workspaceHiddenPanelIds],
  );
  const panelSpecs = effectiveWorkspaceEntry.panelSpecs;
  const toggleablePanelSpecs = React.useMemo(
    () => panelSpecs.filter((panel) => !isPinnedPanelId(panel.id)),
    [panelSpecs],
  );

  const staleWorkspaceCorrectedRef = React.useRef(false);
  React.useEffect(() => {
    if (!workspaceCatalogReady) return;
    const aliasedActiveWorkspaceId = resolveWorkspaceAlias(activeWorkspaceId);
    const aliasedOpenWorkspaceIds = openWorkspaceIds.map((workspaceId) => resolveWorkspaceAlias(workspaceId));
    const activeNeedsAliasRewrite = aliasedActiveWorkspaceId !== activeWorkspaceId;
    const openNeedsAliasRewrite = aliasedOpenWorkspaceIds.some((workspaceId, index) => workspaceId !== openWorkspaceIds[index]);
    const activeInvalid = !availableWorkspaceIds.includes(aliasedActiveWorkspaceId);
    const openInvalid = aliasedOpenWorkspaceIds.some((id) => !availableWorkspaceIds.includes(id));
    if (!activeNeedsAliasRewrite && !openNeedsAliasRewrite && !activeInvalid && !openInvalid) return;
    const filtered = aliasedOpenWorkspaceIds.filter((id): id is RepoWorkspaceId => availableWorkspaceIds.includes(id));
    const nextOpen = filtered.length > 0 ? filtered : (['planning'] as RepoWorkspaceId[]);
    setOpenWorkspaceIds(nextOpen);
    if (activeInvalid) {
      setActiveWorkspace('planning');
      if (process.env.NODE_ENV !== 'production' && !staleWorkspaceCorrectedRef.current) {
        staleWorkspaceCorrectedRef.current = true;
        console.warn(
          '[Repo Studio] Stale or removed workspace id "%s" was corrected to planning.',
          activeWorkspaceId,
        );
      }
    } else if (activeNeedsAliasRewrite) {
      setActiveWorkspace(aliasedActiveWorkspaceId);
    }
  }, [
    activeWorkspaceId,
    availableWorkspaceIds,
    openWorkspaceIds,
    resolveWorkspaceAlias,
    setActiveWorkspace,
    setOpenWorkspaceIds,
    workspaceCatalogReady,
  ]);

  const visibility = React.useMemo(() => {
    const hidden = new Set(activeHiddenPanelIds);
    const next: Record<string, boolean> = {};
    for (const panel of panelSpecs) {
      next[panel.key] = !hidden.has(panel.id);
    }
    return next;
  }, [activeHiddenPanelIds, panelSpecs]);
  const assistantPanelSpec = React.useMemo(
    () => panelSpecs.find((panel) => panel.id === 'assistant') || null,
    [panelSpecs],
  );
  const assistantPanelVisible = assistantPanelSpec ? visibility[assistantPanelSpec.key] !== false : false;

  const {
    commandView,
    setCommandView,
    setCommandRows,
    commandSources,
    filteredCommands,
  } = useCommandFilters(commands);

  const { setCommandOutput } = useCommandOutput();
  const {
    confirmRuns,
    setConfirmRuns,
    runCommand,
  } = useCommandRuns(setCommandOutput);

  const persistLocalSettings = React.useCallback(async (settings: Record<string, unknown>) => {
    await upsertSettings({
      scope: 'local',
      scopeId: 'default',
      workspaceId: activeWorkspaceId,
      loopId: activeLoopId,
      settings,
    });
  }, [activeLoopId, activeWorkspaceId]);

  const {
    platformBaseUrl,
    setPlatformBaseUrl,
    platformAutoValidate,
    setPlatformAutoValidate,
    platformStatus,
    platformBusy,
    updatePlatformBaseUrl,
    updatePlatformAutoValidate,
    connectPlatform,
    validatePlatform,
    disconnectPlatform,
    refreshPlatformStatus,
  } = usePlatformAuth(setCommandOutput, persistLocalSettings);

  const {
    envOutput,
    envDoctorPayload,
    dependencyHealth,
    runtimeDeps,
    runEnvDoctor,
    runEnvReconcile,
    refreshDependencyHealth,
  } = useEnvDoctor(profile, mode);

  const loadSettingsSnapshot = React.useCallback(async (workspaceId: string, loopId: string) => {
    const payload = await fetchSettingsSnapshot({ workspaceId, loopId });
    if (!payload?.ok || !payload.merged || typeof payload.merged !== 'object') return;
    const merged = payload.merged as Record<string, any>;
    const mergedEnv = merged.env && typeof merged.env === 'object' ? merged.env : {};
    const mergedCommands = merged.commands && typeof merged.commands === 'object' ? merged.commands : {};
    const mergedPanels = merged.panels && typeof merged.panels === 'object' ? merged.panels : {};
    const prompts = getAssistantPrompts(merged, loopId);
    setForgeAssistantPrompt(prompts.forgeAssistant);
    setCodexAssistantPrompt(prompts.codexAssistant);

    const profileValue = String(mergedEnv.profile || '').trim();
    if (profileValue) setProfile(profileValue);
    const modeValue = String(mergedEnv.mode || '').trim().toLowerCase();
    if (modeValue === 'local' || modeValue === 'preview' || modeValue === 'production' || modeValue === 'headless') {
      setMode(modeValue);
    }
    if (typeof mergedCommands.confirmRuns === 'boolean') {
      setConfirmRuns(mergedCommands.confirmRuns);
    }
    if (mergedCommands.view && typeof mergedCommands.view === 'object') {
      replaceCommandView(mergedCommands.view as RepoCommandView);
    }
    if (mergedPanels.workspaceHiddenPanelIds && typeof mergedPanels.workspaceHiddenPanelIds === 'object') {
      replaceWorkspaceHiddenPanelIds(mergedPanels.workspaceHiddenPanelIds as Partial<Record<RepoWorkspaceId, string[]>>);
    } else if (Array.isArray(mergedPanels.hiddenPanelIds)) {
      replaceHiddenPanelIds(mergedPanels.hiddenPanelIds.map((item: unknown) => String(item)).filter(Boolean));
    }

    const mergedPlatform = merged.platform && typeof merged.platform === 'object'
      ? merged.platform as Record<string, unknown>
      : {};
    if (typeof mergedPlatform.baseUrl === 'string') {
      setPlatformBaseUrl(String(mergedPlatform.baseUrl));
    }
    if (typeof mergedPlatform.autoValidate === 'boolean') {
      setPlatformAutoValidate(mergedPlatform.autoValidate);
    }
    const mergedReviewQueue = merged.reviewQueue && typeof merged.reviewQueue === 'object'
      ? merged.reviewQueue as Record<string, unknown>
      : {};
    const trustMode = String(mergedReviewQueue.trustMode || '').trim().toLowerCase();
    setReviewQueueTrustMode(trustMode === 'auto-approve-all' ? 'auto-approve-all' : 'require-approval');
    setReviewQueueLastAutoApplyAt(
      typeof mergedReviewQueue.lastAutoApplyAt === 'string'
        ? mergedReviewQueue.lastAutoApplyAt
        : '',
    );
  }, [
    replaceCommandView,
    replaceHiddenPanelIds,
    replaceWorkspaceHiddenPanelIds,
    setConfirmRuns,
    setPlatformBaseUrl,
    setPlatformAutoValidate,
  ]);

  const {
    planningSnapshot,
    loopSnapshot,
    switchingLoop,
    refreshLoopSnapshot,
    switchLoop,
  } = usePlanningSync(planning, loops, {
    activeWorkspaceId,
    activeLoopId,
    setActiveLoopId,
    setProfile,
    setCommandOutput,
    loadSettingsSnapshot,
  });

  React.useEffect(() => {
    if (!selectedDocId) {
      setSelectedDocId(planningSnapshot.docs[0]?.id || null);
      return;
    }
    const exists = planningSnapshot.docs.some((doc) => doc.id === selectedDocId);
    if (!exists) {
      setSelectedDocId(planningSnapshot.docs[0]?.id || null);
    }
  }, [planningSnapshot.docs, selectedDocId]);

  const selectedDoc = React.useMemo(
    () => planningSnapshot.docs.find((doc) => doc.id === selectedDocId) || null,
    [planningSnapshot.docs, selectedDocId],
  );

  const persistHiddenPanels = React.useCallback(() => {
    const state = useRepoStudioShellStore.getState();
    const currentWorkspaceId = state.route.activeWorkspaceId;
    const workspaceMap = state.workspaceHiddenPanelIds || {};
    persistLocalSettings({
      panels: {
        hiddenPanelIds: workspaceMap[currentWorkspaceId] || [],
        workspaceHiddenPanelIds: workspaceMap,
      },
    }).catch(() => {});
  }, [persistLocalSettings]);

  const setPanelVisibleAndPersist = React.useCallback((
    panelId: string,
    visible: boolean,
    workspaceId?: RepoWorkspaceId,
  ) => {
    if (isPinnedPanelId(panelId) && !visible) return;
    if (panelId === 'assistant') {
      setPanelVisibleAcrossWorkspaces('assistant', visible, availableWorkspaceIds as RepoWorkspaceId[]);
    } else {
      const targetWorkspaceId = workspaceId || activeWorkspaceId;
      setPanelVisibleForWorkspace(targetWorkspaceId, panelId, visible);
    }
    persistHiddenPanels();
  }, [
    activeWorkspaceId,
    availableWorkspaceIds,
    persistHiddenPanels,
    setPanelVisibleAcrossWorkspaces,
    setPanelVisibleForWorkspace,
  ]);

  const restorePanelsAndPersist = React.useCallback(() => {
    restoreWorkspacePanels(activeWorkspaceId);
    persistHiddenPanels();
  }, [activeWorkspaceId, persistHiddenPanels, restoreWorkspacePanels]);

  const refreshCommands = React.useCallback(async () => {
    const payload = await fetchCommandsModel();
    if (Array.isArray(payload.commands)) {
      setCommandRows(payload.commands as Parameters<typeof setCommandRows>[0]);
    }
    if (payload.commandView && typeof payload.commandView === 'object') {
      replaceCommandView(payload.commandView as RepoCommandView);
    }
  }, [replaceCommandView, setCommandRows]);

  const refreshProjectAndAuth = React.useCallback(async () => {
    const [projectsPayload, githubPayload, extensionsPayload, registryPayload] = await Promise.allSettled([
      fetchRepoProjects(),
      fetchGitHubStatus(),
      fetchRepoWorkspaceExtensions(),
      fetchRepoWorkspaceExtensionRegistry(),
    ]);

    if (projectsPayload.status === 'fulfilled' && projectsPayload.value.ok) {
      const nextProjects = Array.isArray(projectsPayload.value.projects) ? projectsPayload.value.projects : [];
      setProjects(nextProjects);
      setActiveProjectId(projectsPayload.value.activeProject?.projectId || '');
    }

    if (githubPayload.status === 'fulfilled' && githubPayload.value.ok) {
      setGitHubStatus(githubPayload.value);
    }

    if (extensionsPayload.status === 'fulfilled') {
      const payload = extensionsPayload.value;
      if (payload.ok) {
        setWorkspaceExtensions(Array.isArray(payload.extensions) ? payload.extensions : []);
        setWorkspaceExtensionWarnings(Array.isArray(payload.warnings) ? payload.warnings : []);
      } else {
        setWorkspaceExtensionWarnings((current) => dedupeMessages([
          ...current,
          String(payload.message || 'Unable to refresh workspace extensions.'),
        ]));
      }
      setWorkspaceCatalogReady(true);
    } else {
      setWorkspaceExtensionWarnings((current) => dedupeMessages([
        ...current,
        toErrorMessage(extensionsPayload.reason, 'Unable to refresh workspace extensions.'),
      ]));
      setWorkspaceCatalogReady(true);
    }

    if (registryPayload.status === 'fulfilled') {
      const payload = registryPayload.value;
      if (payload.ok) {
        setExtensionRegistryWarnings(Array.isArray(payload.warnings) ? payload.warnings : []);
      } else {
        setExtensionRegistryWarnings((current) => dedupeMessages([
          ...current,
          String(payload.message || 'Unable to refresh extension registry.'),
        ]));
      }
    } else {
      setExtensionRegistryWarnings((current) => dedupeMessages([
        ...current,
        toErrorMessage(registryPayload.reason, 'Unable to refresh extension registry.'),
      ]));
    }
  }, []);

  const refreshAfterProjectSwitch = React.useCallback(async () => {
    await Promise.allSettled([
      refreshProjectAndAuth(),
      refreshCommands(),
      refreshDependencyHealth(),
      refreshPlatformStatus(),
      refreshLoopSnapshot(activeLoopId),
    ]);
  }, [
    activeLoopId,
    refreshCommands,
    refreshDependencyHealth,
    refreshLoopSnapshot,
    refreshPlatformStatus,
      refreshProjectAndAuth,
  ]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = () => {
      refreshAfterProjectSwitch().catch(() => {});
    };
    window.addEventListener(EXTENSION_REFRESH_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(EXTENSION_REFRESH_EVENT, handler as EventListener);
    };
  }, [refreshAfterProjectSwitch]);

  const importProjectFromPath = React.useCallback(async (rootPathInput: string) => {
    const rootPath = String(rootPathInput || '').trim();
    if (!rootPath) return;
    setProjectActionBusy(true);
    try {
      const payload = await importLocalRepoProject({ rootPath });
      if (!payload.ok) {
        setCommandOutput(payload.message || 'Unable to open project folder.');
        return;
      }
      setOpenProjectDialogOpen(false);
      setOpenProjectPath('');
      setCommandOutput(payload.message || `Opened ${payload.project?.name || rootPath}.`);
      await refreshAfterProjectSwitch();
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to open project folder.'));
    } finally {
      setProjectActionBusy(false);
    }
  }, [refreshAfterProjectSwitch, setCommandOutput]);

  const loadBrowseDirectory = React.useCallback(async (pathInput?: string) => {
    setBrowseBusy(true);
    try {
      const payload = await browseRepoProjectDirectories({ path: pathInput });
      if (!payload.ok) {
        setCommandOutput(payload.message || 'Unable to browse local folders.');
        return;
      }
      setBrowseCwd(payload.cwd);
      setBrowseParent(payload.parent || null);
      setBrowseRoots(Array.isArray(payload.roots) ? payload.roots : []);
      setBrowseEntries(Array.isArray(payload.entries) ? payload.entries : []);
      if (!openProjectPath) {
        setOpenProjectPath(payload.cwd || '');
      }
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to browse local folders.'));
    } finally {
      setBrowseBusy(false);
    }
  }, [openProjectPath, setCommandOutput]);

  const pickFolderWithDesktopBridge = React.useCallback(async () => {
    const desktop = getDesktopRuntimeBridge();
    if (!desktop || typeof desktop.pickProjectFolder !== 'function') return null;
    try {
      const result = await desktop.pickProjectFolder();
      if (!result?.ok) {
        if (result?.canceled !== true && result?.message) {
          setCommandOutput(result.message);
        }
        return null;
      }
      return String(result.path || '').trim() || null;
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to open folder picker.'));
      return null;
    }
  }, [setCommandOutput]);

  const handleBrowseForOpenProject = React.useCallback(async () => {
    const pickedPath = await pickFolderWithDesktopBridge();
    if (pickedPath) {
      setOpenProjectPath(pickedPath);
      loadBrowseDirectory(pickedPath).catch(() => {});
      return;
    }
    loadBrowseDirectory(openProjectPath || browseCwd).catch(() => {});
  }, [browseCwd, loadBrowseDirectory, openProjectPath, pickFolderWithDesktopBridge]);

  const handleBrowseForCloneTarget = React.useCallback(async () => {
    const pickedPath = await pickFolderWithDesktopBridge();
    if (!pickedPath) return;
    setCloneTargetPath(pickedPath);
  }, [pickFolderWithDesktopBridge]);

  const handleCloneFromGitHub = React.useCallback(async () => {
    const remoteUrl = String(cloneRemoteUrl || '').trim();
    const targetPath = String(cloneTargetPath || '').trim();
    if (!remoteUrl || !targetPath) return;
    setProjectActionBusy(true);
    try {
      const payload = await cloneRepoProject({ remoteUrl, targetPath });
      if (!payload.ok) {
        setCommandOutput(payload.message || 'Unable to clone project.');
        return;
      }
      setOpenProjectDialogOpen(false);
      setCloneRemoteUrl('');
      setCloneTargetPath('');
      setCommandOutput(payload.message || `Cloned ${payload.project?.name || remoteUrl}.`);
      await refreshAfterProjectSwitch();
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to clone project.'));
    } finally {
      setProjectActionBusy(false);
    }
  }, [cloneRemoteUrl, cloneTargetPath, refreshAfterProjectSwitch, setCommandOutput]);

  const handleConnectGitHub = React.useCallback(async () => {
    setGithubAuthBusy(true);
    try {
      const payload = await startGitHubDeviceLogin();
      if (!payload.ok) {
        setCommandOutput(payload.message || 'Unable to start GitHub sign in.');
        return;
      }
      if (payload.authUrl) {
        window.open(payload.authUrl, '_blank', 'noopener,noreferrer');
      }
      setCommandOutput(payload.message || 'Complete GitHub sign in in your browser, then retry clone/push.');
      await refreshProjectAndAuth();
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to start GitHub sign in.'));
    } finally {
      setGithubAuthBusy(false);
    }
  }, [refreshProjectAndAuth, setCommandOutput]);

  const handleOpenProjectFolder = React.useCallback(async () => {
    setOpenProjectDialogTab('local');
    setShowAdvancedPathInput(false);
    setOpenProjectDialogOpen(true);
    loadBrowseDirectory(openProjectPath || '').catch(() => {});
  }, [loadBrowseDirectory, openProjectPath]);

  const handleSwitchProject = React.useCallback(async (projectId: string) => {
    const normalizedProjectId = String(projectId || '').trim();
    if (!normalizedProjectId) return;
    setProjectActionBusy(true);
    try {
      const payload = await setActiveRepoProject(normalizedProjectId);
      if (!payload.ok) {
        setCommandOutput(payload.message || 'Unable to switch project.');
        return;
      }
      setCommandOutput(payload.message || `Switched to ${payload.project?.name || normalizedProjectId}.`);
      await refreshAfterProjectSwitch();
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to switch project.'));
    } finally {
      setProjectActionBusy(false);
    }
  }, [refreshAfterProjectSwitch, setCommandOutput]);

  const handlePushToGitHub = React.useCallback(async () => {
    setProjectActionBusy(true);
    try {
      const payload = await pushGit();
      if (!payload.ok) {
        setCommandOutput(payload.message || payload.stderr || 'Git push failed.');
        return;
      }
      setCommandOutput(payload.message || 'Git push completed.');
      await refreshProjectAndAuth();
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to push to GitHub.'));
    } finally {
      setProjectActionBusy(false);
    }
  }, [refreshProjectAndAuth, setCommandOutput]);

  React.useEffect(() => {
    setActiveLoopId(loops.activeLoopId);
    const active = loops.entries.find((entry) => entry.id === loops.activeLoopId);
    if (active?.profile) setProfile(active.profile);
    loadSettingsSnapshot(activeWorkspaceId, loops.activeLoopId).catch(() => {});
    refreshProjectAndAuth().catch(() => {});
    refreshCommands().catch(() => {});
    refreshDependencyHealth().catch(() => {});
    refreshPlatformStatus().catch(() => {});
    refreshLoopSnapshot(loops.activeLoopId).catch(() => {});
  }, [
    activeWorkspaceId,
    loadSettingsSnapshot,
    loops.activeLoopId,
    loops.entries,
    refreshCommands,
    refreshDependencyHealth,
    refreshPlatformStatus,
    refreshProjectAndAuth,
    refreshLoopSnapshot,
    setActiveLoopId,
  ]);

  React.useEffect(() => {
    if (!openProjectDialogOpen) return;
    if (!cloneTargetPath && openProjectPath) {
      setCloneTargetPath(openProjectPath);
    }
  }, [cloneTargetPath, openProjectDialogOpen, openProjectPath]);

  React.useEffect(() => {
    saveCommandView(commandView).catch(() => {});
  }, [commandView]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      refreshProjectAndAuth().catch(() => {});
    }, 15000);
    return () => {
      window.clearInterval(timer);
    };
  }, [refreshProjectAndAuth]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
    const refreshIfVisible = () => {
      if (document.visibilityState === 'hidden') return;
      refreshProjectAndAuth().catch(() => {});
    };
    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [refreshProjectAndAuth]);

  const extensionWarningsSignature = React.useMemo(
    () => [...workspaceExtensionWarnings, ...extensionRegistryWarnings].join('\n'),
    [workspaceExtensionWarnings, extensionRegistryWarnings],
  );
  const reportedExtensionWarningsRef = React.useRef('');
  React.useEffect(() => {
    if (!extensionWarningsSignature) return;
    if (reportedExtensionWarningsRef.current === extensionWarningsSignature) return;
    reportedExtensionWarningsRef.current = extensionWarningsSignature;
    setCommandOutput(`[extensions]\n${extensionWarningsSignature}`);
  }, [extensionWarningsSignature, setCommandOutput]);

  React.useEffect(() => {
    const bridge = getDesktopRuntimeBridge();
    if (!bridge) return undefined;

    const unsubscribe = bridge.subscribeRuntimeEvents((event) => {
      if (!event || typeof event !== 'object') return;
      if (
        event.type === 'treeChanged'
        || event.type === 'searchInvalidated'
        || event.type === 'gitStatusInvalidated'
      ) {
        refreshLoopSnapshot(activeLoopId).catch(() => {});
      }
      if (event.type === 'watcherHealth') {
        const message = `[desktop watcher] ${event.status || 'unknown'}${event.reason ? `: ${event.reason}` : ''}`;
        setCommandOutput(message);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeLoopId, refreshLoopSnapshot, setCommandOutput]);

  React.useEffect(() => {
    if (!settingsSidebarOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSettingsSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [settingsSidebarOpen, setSettingsSidebarOpen]);

  const updateProfile = React.useCallback((value: string) => {
    setProfile(value);
    persistLocalSettings({
      env: {
        profile: value,
      },
    }).catch(() => {});
  }, [persistLocalSettings]);

  const updateMode = React.useCallback((value: RepoMode) => {
    setMode(value);
    persistLocalSettings({
      env: {
        mode: value,
      },
    }).catch(() => {});
  }, [persistLocalSettings]);

  const updateConfirmRuns = React.useCallback((value: boolean) => {
    setConfirmRuns(value);
    persistLocalSettings({
      commands: {
        confirmRuns: value,
      },
    }).catch(() => {});
  }, [persistLocalSettings, setConfirmRuns]);

  const updateReviewQueueTrustMode = React.useCallback((value: 'require-approval' | 'auto-approve-all') => {
    const trustMode = value === 'auto-approve-all' ? 'auto-approve-all' : 'require-approval';
    setReviewQueueTrustMode(trustMode);
    persistLocalSettings({
      reviewQueue: {
        trustMode,
        autoApplyEnabled: trustMode === 'auto-approve-all',
      },
    }).catch(() => {});
  }, [persistLocalSettings]);

  const updateForgeAssistantPrompt = React.useCallback((value: string) => {
    setForgeAssistantPrompt(value);
    persistLocalSettings({
      assistant: {
        prompts: {
          byLoop: {
            [activeLoopId]: {
              forgeAssistant: value,
            },
          },
        },
      },
    }).catch(() => {});
  }, [activeLoopId, persistLocalSettings]);

  const updateCodexAssistantPrompt = React.useCallback((value: string) => {
    setCodexAssistantPrompt(value);
    persistLocalSettings({
      assistant: {
        prompts: {
          byLoop: {
            [activeLoopId]: {
              codexAssistant: value,
            },
          },
        },
      },
    }).catch(() => {});
  }, [activeLoopId, persistLocalSettings]);

  const toggleCommand = React.useCallback(async (commandId: string, disabled: boolean) => {
    try {
      const payload = await toggleCommandPolicy({ commandId, disabled });
      if (payload.ok) {
        await refreshCommands();
        return;
      }
      setCommandOutput([
        payload.message || 'Unable to update command policy.',
      ].filter(Boolean).join('\n\n'));
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to update command policy.'));
    }
  }, [refreshCommands, setCommandOutput]);

  const stopRepoStudioRuntime = React.useCallback(async () => {
    try {
      const payload = await stopRuntime();
      setCommandOutput([
        payload.message || 'No stop message.',
        payload.stdout || '',
        payload.stderr || '',
      ].filter(Boolean).join('\n\n'));
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to stop RepoStudio runtime.'));
    }
  }, [setCommandOutput]);

  const resetDockLayout = React.useCallback(() => {
    clearDockLayout(activeLayoutId);
    setLayoutResetCounter((current) => current + 1);
  }, [activeLayoutId, clearDockLayout]);

  const openWorkspaceTab = React.useCallback((workspaceId: RepoWorkspaceId) => {
    openWorkspace(resolveWorkspaceAlias(workspaceId));
  }, [openWorkspace, resolveWorkspaceAlias]);

  const launchTerminalProfile = React.useCallback((profile: {
    profileId: string;
    name?: string;
    command?: string;
    args?: string[];
  }) => {
    terminalLaunchCounterRef.current += 1;
    setTerminalLaunchRequest({
      requestId: terminalLaunchCounterRef.current,
      profileId: profile.profileId,
      name: profile.name,
      command: profile.command,
      args: profile.args,
    });
    setTerminalOpen(true);
  }, []);

  const layoutMenuItems = React.useMemo(() => [
    {
      id: 'layout',
      label: 'Layout',
      icon: <LayoutPanelTop size={16} />,
      submenu: [
        ...toggleablePanelSpecs.map((spec) => ({
          id: `panel-${spec.id}`,
          label: visibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
          onSelect: () => setPanelVisibleAndPersist(spec.id, !(visibility[spec.key] !== false), effectiveWorkspaceId),
        })),
        { id: 'view-sep-layout', type: 'separator' as const },
        {
          id: 'restore-all-panels',
          label: 'Restore all panels',
          onSelect: () => restorePanelsAndPersist(),
        },
        {
          id: 'reset-layout',
          label: 'Reset layout',
          onSelect: resetDockLayout,
        },
        {
          id: 'open-settings',
          label: 'Open settings',
          onSelect: () => setSettingsSidebarOpen(true),
        },
      ],
    },
  ], [effectiveWorkspaceId, resetDockLayout, restorePanelsAndPersist, setPanelVisibleAndPersist, setSettingsSidebarOpen, toggleablePanelSpecs, visibility]);

  const focusWorkspace = React.useCallback((workspaceId: RepoWorkspaceId, panelId?: string) => {
    openWorkspaceTab(workspaceId);
    if (panelId) {
      setPanelVisibleAndPersist(panelId, true, workspaceId);
    }
  }, [openWorkspaceTab, setPanelVisibleAndPersist]);

  const activeProject = React.useMemo(
    () => projects.find((project) => project.projectId === activeProjectId) || null,
    [activeProjectId, projects],
  );
  const githubLoggedIn = githubStatus?.github?.loggedIn === true;
  const canPushToGitHub = Boolean(githubLoggedIn && activeProject?.isGitRepo && !projectActionBusy);
  const pushToGitHubLabel = !githubLoggedIn
    ? 'Push to GitHub (Sign in required)'
    : !activeProject?.isGitRepo
      ? 'Push to GitHub (Git repo required)'
      : 'Push to GitHub';

  const menus = React.useMemo(
    () => buildRepoWorkspaceMenus({
      workspaceId: activeWorkspaceId,
      openWorkspaceIds,
      availableWorkspaces: workspaceEntries.map((entry) => ({ id: entry.id, label: entry.label })),
      focusPanelSpecs: panelSpecs.map((panel) => ({ id: panel.id, label: panel.label })),
      assistantPanelVisible,
      nextAction: planningSnapshot.nextAction,
      onRefreshSnapshot: () => refreshLoopSnapshot(activeLoopId).catch(() => {}),
      onRunEnvDoctor: () => runEnvDoctor().catch(() => {}),
      onRunEnvReconcile: () => runEnvReconcile().catch(() => {}),
      onFocusWorkspace: focusWorkspace,
      onOpenWorkspace: openWorkspaceTab,
      onFocusAssistantPanel: () => setPanelVisibleAndPersist('assistant', true, effectiveWorkspaceId),
      onToggleAssistantPanel: () => setPanelVisibleAndPersist('assistant', !assistantPanelVisible, effectiveWorkspaceId),
      onOpenProjectFolder: () => {
        handleOpenProjectFolder().catch(() => {});
      },
      onSwitchProject: (projectId) => {
        handleSwitchProject(projectId).catch(() => {});
      },
      onPushToGitHub: () => {
        handlePushToGitHub().catch(() => {});
      },
      onNewTerminal: () => launchTerminalProfile({ profileId: 'shell', name: 'Shell' }),
      onLaunchCodexCli: () => launchTerminalProfile({ profileId: 'codex', name: 'Codex CLI', command: 'codex' }),
      onLaunchClaudeCli: () => launchTerminalProfile({ profileId: 'claude', name: 'Claude Code CLI', command: 'claude' }),
      onCopyText: copyText,
      projects,
      activeProjectId,
      canPushToGitHub,
      pushToGitHubLabel,
      layoutViewItems: [
        ...layoutMenuItems,
        {
          id: 'view-reload-window',
          label: 'Reload Window',
          onSelect: () => window.location.reload(),
        },
      ],
    }),
    [
      activeLoopId,
      activeWorkspaceId,
      activeProjectId,
      assistantPanelVisible,
      canPushToGitHub,
      effectiveWorkspaceId,
      focusWorkspace,
      handleOpenProjectFolder,
      handlePushToGitHub,
      handleSwitchProject,
      layoutMenuItems,
      launchTerminalProfile,
      openWorkspaceIds,
      panelSpecs,
      openWorkspaceTab,
      planningSnapshot.nextAction,
      projects,
      pushToGitHubLabel,
      refreshLoopSnapshot,
      runEnvDoctor,
      runEnvReconcile,
      setPanelVisibleAndPersist,
      workspaceEntries,
    ],
  );

  const copyPlanningMentionToken = React.useCallback(() => {
    if (!selectedDoc) return;
    copyText(`@planning/${selectedDoc.id}`);
  }, [selectedDoc]);

  const openForgeAssistant = React.useCallback(() => {
    setPanelVisibleAndPersist('assistant', true, effectiveWorkspaceId);
  }, [effectiveWorkspaceId, setPanelVisibleAndPersist]);

  const panelContext = React.useMemo<RepoStudioPanelContext>(() => ({
    planningSnapshot,
    loopEntries: loopSnapshot.entries,
    activeLoopId,
    switchingLoop,
    selectedDocId,
    selectedDocContent: selectedDoc?.content || '',
    profile,
    mode,
    envOutput,
    envDoctorPayload: envDoctorPayload as EnvDoctorPayload | null,
    dependencyHealth,
    runtimeDeps,
    commandView,
    commandSources,
    filteredCommands,
    onSelectDoc: setSelectedDocId,
    onSwitchLoop: switchLoop,
    onCopyMentionToken: copyPlanningMentionToken,
    onOpenAssistant: openForgeAssistant,
    onCopyText: copyText,
    onRefreshLoopSnapshot: () => refreshLoopSnapshot(activeLoopId).catch(() => {}),
    onProfileChange: updateProfile,
    onModeChange: updateMode,
    onRunEnvDoctor: () => runEnvDoctor(),
    onRunEnvReconcile: () => runEnvReconcile(),
    onRefreshDeps: () => refreshDependencyHealth(),
    onSetCommandView: setCommandView,
    onRunCommand: runCommand,
    onToggleCommand: toggleCommand,
  }), [
    planningSnapshot,
    loopSnapshot.entries,
    activeLoopId,
    switchingLoop,
    selectedDocId,
    selectedDoc,
    profile,
    mode,
    envOutput,
    envDoctorPayload,
    dependencyHealth,
    runtimeDeps,
    commandView,
    commandSources,
    filteredCommands,
    switchLoop,
    copyPlanningMentionToken,
    openForgeAssistant,
    updateProfile,
    updateMode,
    runEnvDoctor,
    runEnvReconcile,
    refreshDependencyHealth,
    setCommandView,
    runCommand,
    toggleCommand,
    refreshLoopSnapshot,
  ]);

  const ActiveLayout = effectiveWorkspaceEntry.component;

  return (
    <RepoStudioProvider
      value={{
        profile,
        mode,
        platformStatus,
        copyText,
        workspaceExtensions,
        workspaceExtensionMap,
      }}
    >
      <SidebarProvider
        defaultOpen={false}
        open={settingsSidebarOpen}
        onOpenChange={setSettingsSidebarOpen}
        className="h-screen w-full"
      >
        <SidebarInset className="h-screen overflow-hidden bg-background">
          <StudioApp className="h-full">
            <StudioApp.Tabs label="RepoStudio Tabs" tabListClassName="justify-center">
              <StudioApp.Tabs.Left>
                <WorkspaceMenubar menus={menus} />
              </StudioApp.Tabs.Left>
              <StudioApp.Tabs.Main>
                {openWorkspaceIds.map((workspaceId) => (
                  <StudioApp.Tab
                    key={workspaceId}
                    label={workspaceLabels[workspaceId] || workspaceId}
                    isActive={activeWorkspaceId === workspaceId}
                    domain="forge"
                    onSelect={() => openWorkspaceTab(workspaceId)}
                    onClose={() => closeWorkspace(workspaceId)}
                  />
                ))}
              </StudioApp.Tabs.Main>
              <StudioApp.Tabs.Right>
                <RepoCodexControls />
                <SidebarTrigger aria-label="Toggle settings sidebar" />
              </StudioApp.Tabs.Right>
            </StudioApp.Tabs>

            <StudioApp.Content className="min-h-0 overflow-hidden">
              <div className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ActiveLayout
                    key={`${effectiveWorkspaceId}:${layoutResetCounter}`}
                    layoutId={activeLayoutId}
                    layoutJson={activeLayoutJson}
                    onLayoutChange={(json) => setDockLayout(activeLayoutId, json)}
                    clearLayout={() => clearDockLayout(activeLayoutId)}
                    onPanelClosed={(panelId) => {
                      if (isPinnedPanelId(panelId)) return;
                      setPanelVisibleAndPersist(panelId, false, effectiveWorkspaceId);
                    }}
                    hiddenPanelIds={activeHiddenPanelIds}
                    panelContext={panelContext}
                  />
                </div>
                <GlobalTerminalDock
                  open={terminalOpen}
                  onOpenChange={setTerminalOpen}
                  launchRequest={terminalLaunchRequest}
                  cwd={activeProject?.rootPath || null}
                />
              </div>
            </StudioApp.Content>
          </StudioApp>
        </SidebarInset>

        <Sidebar side="right" collapsible="offcanvas" className="border-l border-sidebar-border">
          <SidebarHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">Settings</h2>
                <p className="text-xs text-muted-foreground">
                  Right sidebar is reserved for settings/codegen only.
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Close settings sidebar"
                onClick={() => setSettingsSidebarOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <RepoSettingsPanelContent
              profile={profile}
              mode={mode}
              confirmRuns={confirmRuns}
              reviewQueueTrustMode={reviewQueueTrustMode}
              reviewQueueLastAutoApplyAt={reviewQueueLastAutoApplyAt}
              activeLoopId={activeLoopId}
              forgeAssistantPrompt={forgeAssistantPrompt}
              codexAssistantPrompt={codexAssistantPrompt}
              platformBaseUrl={platformBaseUrl}
              platformAutoValidate={platformAutoValidate}
              platformStatus={platformStatus}
              platformBusy={platformBusy}
              panelSpecs={toggleablePanelSpecs}
              panelVisibility={visibility}
              onProfileChange={updateProfile}
              onModeChange={updateMode}
              onConfirmRunsChange={updateConfirmRuns}
              onReviewQueueTrustModeChange={updateReviewQueueTrustMode}
              onForgeAssistantPromptChange={updateForgeAssistantPrompt}
              onCodexAssistantPromptChange={updateCodexAssistantPrompt}
              onPlatformBaseUrlChange={updatePlatformBaseUrl}
              onPlatformAutoValidateChange={updatePlatformAutoValidate}
              onPlatformConnect={connectPlatform}
              onPlatformValidate={validatePlatform}
              onPlatformDisconnect={disconnectPlatform}
              onSetPanelVisible={(panelId, visible) => setPanelVisibleAndPersist(panelId, visible)}
              onRestorePanels={restorePanelsAndPersist}
              onStopRuntime={stopRepoStudioRuntime}
            />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>

      <Dialog open={openProjectDialogOpen} onOpenChange={setOpenProjectDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Open Project Folder</DialogTitle>
            <DialogDescription>
              Browse folders to open locally, or clone from GitHub in this same flow.
            </DialogDescription>
          </DialogHeader>
          <Tabs value={openProjectDialogTab} onValueChange={(value) => setOpenProjectDialogTab(value as OpenProjectDialogTab)}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="local" className="gap-2">
                <FolderTree size={14} />
                Local Folder
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-2">
                <Github size={14} />
                GitHub
              </TabsTrigger>
            </TabsList>

            <TabsContent value="local" className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleBrowseForOpenProject().catch(() => {});
                  }}
                  disabled={projectActionBusy || browseBusy}
                >
                  <FolderOpen size={14} className="mr-1" />
                  Browse Folder
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    loadBrowseDirectory(browseParent || '').catch(() => {});
                  }}
                  disabled={projectActionBusy || browseBusy || !browseParent}
                >
                  Up
                </Button>
                {browseBusy ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" />
                    loading folders
                  </span>
                ) : null}
              </div>

              <div className="space-y-1 rounded-md border border-border p-2">
                <div className="text-xs text-muted-foreground">Current folder</div>
                <div className="truncate font-mono text-xs">{browseCwd || openProjectPath || '(none selected)'}</div>
              </div>

              {browseRoots.length > 0 ? (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Quick roots</Label>
                  <div className="flex flex-wrap gap-2">
                    {browseRoots.map((root) => (
                      <Button
                        key={root}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          loadBrowseDirectory(root).catch(() => {});
                          setOpenProjectPath(root);
                        }}
                        disabled={projectActionBusy || browseBusy}
                      >
                        {root}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="max-h-56 overflow-auto rounded-md border border-border">
                {browseEntries.length > 0 ? (
                  <ul className="p-1">
                    {browseEntries.map((entry) => (
                      <li key={entry.path}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                          onClick={() => {
                            setOpenProjectPath(entry.path);
                            loadBrowseDirectory(entry.path).catch(() => {});
                          }}
                        >
                          <span className="truncate">{entry.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">open</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-xs text-muted-foreground">
                    No subfolders found.
                  </div>
                )}
              </div>

              <details
                open={showAdvancedPathInput}
                onToggle={(event) => {
                  setShowAdvancedPathInput((event.currentTarget as HTMLDetailsElement).open);
                }}
                className="rounded-md border border-border p-2"
              >
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Advanced: paste absolute path manually
                </summary>
                <Input
                  value={openProjectPath}
                  onChange={(event) => setOpenProjectPath(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    if (projectActionBusy || !openProjectPath.trim()) return;
                    importProjectFromPath(openProjectPath).catch(() => {});
                  }}
                  placeholder="C:\\path\\to\\project or /Users/name/project"
                  className="mt-2"
                />
              </details>
            </TabsContent>

            <TabsContent value="github" className="space-y-3 pt-2">
              <div className="rounded-md border border-border p-2">
                <p className="text-xs text-muted-foreground">
                  Connect GitHub to clone a repository into a local folder, then open it as the active project.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleConnectGitHub().catch(() => {});
                    }}
                    disabled={githubAuthBusy}
                  >
                    {githubLoggedIn ? 'Reconnect GitHub' : 'Connect GitHub'}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Status: {githubLoggedIn ? `connected as ${githubStatus?.github?.username || 'unknown'}` : 'not connected'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-clone-url">Repository URL</Label>
                <Input
                  id="repo-clone-url"
                  value={cloneRemoteUrl}
                  onChange={(event) => setCloneRemoteUrl(event.target.value)}
                  placeholder="https://github.com/org/repo.git"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-clone-target">Target Folder</Label>
                <div className="flex gap-2">
                  <Input
                    id="repo-clone-target"
                    value={cloneTargetPath}
                    onChange={(event) => setCloneTargetPath(event.target.value)}
                    placeholder="C:\\dev\\repo or /Users/name/dev/repo"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      handleBrowseForCloneTarget().catch(() => {});
                    }}
                    disabled={projectActionBusy}
                  >
                    Browse
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenProjectDialogOpen(false)}
              disabled={projectActionBusy}
            >
              Cancel
            </Button>
            {openProjectDialogTab === 'local' ? (
              <Button
                type="button"
                onClick={() => {
                  const targetPath = (openProjectPath || browseCwd || '').trim();
                  importProjectFromPath(targetPath).catch(() => {});
                }}
                disabled={projectActionBusy || !(openProjectPath || browseCwd).trim()}
              >
                Open Folder
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  handleCloneFromGitHub().catch(() => {});
                }}
                disabled={
                  projectActionBusy
                  || !githubLoggedIn
                  || !cloneRemoteUrl.trim()
                  || !cloneTargetPath.trim()
                }
              >
                Clone and Open
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RepoStudioProvider>
  );
}

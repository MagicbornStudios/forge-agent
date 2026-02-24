'use client';

import * as React from 'react';
import { LayoutPanelTop, X } from 'lucide-react';
import { StudioApp } from '@forge/shared/components/app';
import { EditorMenubar } from '@forge/shared/components/editor';
import { Button } from '@forge/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@forge/ui/sidebar';
import { toErrorMessage } from '@/lib/api/http';
import {
  fetchCommandsModel,
  fetchSettingsSnapshot,
  saveCommandView,
  stopRuntime,
  toggleCommandPolicy,
  upsertSettings,
} from '@/lib/api/services';
import type { EnvDoctorPayload, RepoMode } from '@/lib/api/types';
import type { PlanningSnapshot, RepoCommandEntry, RepoLoopsSnapshot } from '@/lib/repo-data';
import type { RepoCommandView, RepoWorkspaceId } from '@/lib/types';
import { getDesktopRuntimeBridge } from '@/lib/desktop-runtime';
import { buildRepoWorkspaceMenus } from '@/lib/app-shell/menu-contributions';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';
import { RepoStudioProvider } from '@/lib/app-shell/RepoStudioContext';
import {
  getWorkspaceLayoutId,
  getWorkspacePanelSpecs,
  REPO_WORKSPACE_LABELS,
} from '@/lib/app-shell/workspace-layout-definitions';
import { useCommandFilters } from '@/components/hooks/useCommandFilters';
import { useCommandOutput } from '@/components/hooks/useCommandOutput';
import { useCommandRuns } from '@/components/hooks/useCommandRuns';
import { useEnvDoctor } from '@/components/hooks/useEnvDoctor';
import { usePlatformAuth } from '@/components/hooks/usePlatformAuth';
import { usePlanningSync } from '@/components/hooks/usePlanningSync';
import { RepoCodexControls } from '@/components/appbar/RepoCodexControls';
import { RepoSettingsPanelContent } from '@/components/settings/RepoSettingsPanelContent';
import { REPO_WORKSPACE_COMPONENTS, type RepoStudioPanelContext } from '@/components/workspaces';

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
    loopAssistant: String(perLoop.loopAssistant || '').trim(),
    codexAssistant: String(perLoop.codexAssistant || '').trim(),
  };
}

export function RepoStudioShell({
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
  const [loopAssistantPrompt, setLoopAssistantPrompt] = React.useState('');
  const [codexAssistantPrompt, setCodexAssistantPrompt] = React.useState('');
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(planning.docs[0]?.id || null);

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

  const activeLayoutId = React.useMemo(() => getWorkspaceLayoutId(activeWorkspaceId), [activeWorkspaceId]);
  const activeLayoutJson = dockLayouts[activeLayoutId] || null;
  const activeHiddenPanelIds = React.useMemo(
    () => workspaceHiddenPanelIds[activeWorkspaceId] || [],
    [activeWorkspaceId, workspaceHiddenPanelIds],
  );
  const panelSpecs = React.useMemo(() => getWorkspacePanelSpecs(activeWorkspaceId), [activeWorkspaceId]);

  const visibility = React.useMemo(() => {
    const hidden = new Set(activeHiddenPanelIds);
    const next: Record<string, boolean> = {};
    for (const panel of panelSpecs) {
      next[panel.key] = !hidden.has(panel.id);
    }
    return next;
  }, [activeHiddenPanelIds, panelSpecs]);

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
    setLoopAssistantPrompt(prompts.loopAssistant);
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
    const targetWorkspaceId = workspaceId || activeWorkspaceId;
    setPanelVisibleForWorkspace(targetWorkspaceId, panelId, visible);
    persistHiddenPanels();
  }, [activeWorkspaceId, persistHiddenPanels, setPanelVisibleForWorkspace]);

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

  React.useEffect(() => {
    setActiveLoopId(loops.activeLoopId);
    const active = loops.entries.find((entry) => entry.id === loops.activeLoopId);
    if (active?.profile) setProfile(active.profile);
    loadSettingsSnapshot(activeWorkspaceId, loops.activeLoopId).catch(() => {});
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
    refreshLoopSnapshot,
    setActiveLoopId,
  ]);

  React.useEffect(() => {
    saveCommandView(commandView).catch(() => {});
  }, [commandView]);

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

  const updateLoopAssistantPrompt = React.useCallback((value: string) => {
    setLoopAssistantPrompt(value);
    persistLocalSettings({
      assistant: {
        prompts: {
          byLoop: {
            [activeLoopId]: {
              loopAssistant: value,
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
    openWorkspace(workspaceId);
  }, [openWorkspace]);

  const layoutMenuItems = React.useMemo(() => [
    {
      id: 'layout',
      label: 'Layout',
      icon: <LayoutPanelTop size={16} />,
      submenu: [
        ...panelSpecs.map((spec) => ({
          id: `panel-${spec.id}`,
          label: visibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
          onSelect: () => setPanelVisibleAndPersist(spec.id, !(visibility[spec.key] !== false), activeWorkspaceId),
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
  ], [activeWorkspaceId, panelSpecs, resetDockLayout, restorePanelsAndPersist, setPanelVisibleAndPersist, setSettingsSidebarOpen, visibility]);

  const focusWorkspace = React.useCallback((workspaceId: RepoWorkspaceId, panelId?: string) => {
    openWorkspaceTab(workspaceId);
    if (panelId) {
      setPanelVisibleAndPersist(panelId, true, workspaceId);
    }
  }, [openWorkspaceTab, setPanelVisibleAndPersist]);

  const menus = React.useMemo(
    () => buildRepoWorkspaceMenus({
      workspaceId: activeWorkspaceId,
      openWorkspaceIds,
      nextAction: planningSnapshot.nextAction,
      onRefreshSnapshot: () => refreshLoopSnapshot(activeLoopId).catch(() => {}),
      onRunEnvDoctor: () => runEnvDoctor().catch(() => {}),
      onRunEnvReconcile: () => runEnvReconcile().catch(() => {}),
      onFocusWorkspace: focusWorkspace,
      onOpenWorkspace: openWorkspaceTab,
      onCopyText: copyText,
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
      focusWorkspace,
      layoutMenuItems,
      openWorkspaceIds,
      openWorkspaceTab,
      planningSnapshot.nextAction,
      refreshLoopSnapshot,
      runEnvDoctor,
      runEnvReconcile,
    ],
  );

  const copyPlanningMentionToken = React.useCallback(() => {
    if (!selectedDoc) return;
    copyText(`@planning/${selectedDoc.id}`);
  }, [selectedDoc]);

  const openLoopAssistant = React.useCallback(() => {
    openWorkspaceTab('loop-assistant');
    setPanelVisibleAndPersist('loop-assistant', true, 'loop-assistant');
  }, [openWorkspaceTab, setPanelVisibleAndPersist]);

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
    onOpenAssistant: openLoopAssistant,
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
    openLoopAssistant,
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

  const ActiveLayout = REPO_WORKSPACE_COMPONENTS[activeWorkspaceId];

  return (
    <RepoStudioProvider
      value={{
        profile,
        mode,
        platformStatus,
        copyText,
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
                <EditorMenubar menus={menus} />
              </StudioApp.Tabs.Left>
              <StudioApp.Tabs.Main>
                {openWorkspaceIds.map((workspaceId) => (
                  <StudioApp.Tab
                    key={workspaceId}
                    label={REPO_WORKSPACE_LABELS[workspaceId]}
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
              <ActiveLayout
                key={`${activeWorkspaceId}:${layoutResetCounter}`}
                layoutId={activeLayoutId}
                layoutJson={activeLayoutJson}
                onLayoutChange={(json) => setDockLayout(activeLayoutId, json)}
                clearLayout={() => clearDockLayout(activeLayoutId)}
                onPanelClosed={(panelId) => setPanelVisibleAndPersist(panelId, false, activeWorkspaceId)}
                hiddenPanelIds={activeHiddenPanelIds}
                panelContext={panelContext}
              />
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
              loopAssistantPrompt={loopAssistantPrompt}
              codexAssistantPrompt={codexAssistantPrompt}
              platformBaseUrl={platformBaseUrl}
              platformAutoValidate={platformAutoValidate}
              platformStatus={platformStatus}
              platformBusy={platformBusy}
              panelSpecs={panelSpecs}
              panelVisibility={visibility}
              onProfileChange={updateProfile}
              onModeChange={updateMode}
              onConfirmRunsChange={updateConfirmRuns}
              onReviewQueueTrustModeChange={updateReviewQueueTrustMode}
              onLoopAssistantPromptChange={updateLoopAssistantPrompt}
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
    </RepoStudioProvider>
  );
}

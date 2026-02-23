
'use client';

import * as React from 'react';
import {
  BookOpen,
  Bot,
  GitCompareArrows,
  LayoutPanelTop,
  ShieldCheck,
  TerminalSquare,
  Wrench,
  X,
} from 'lucide-react';
import { StudioApp } from '@forge/shared/components/app';
import {
  EditorDockLayout,
  EditorMenubar,
  type DockLayoutRef,
} from '@forge/shared/components/editor';
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
import { REPO_STUDIO_LAYOUT_ID, useRepoStudioShellStore } from '@/lib/app-shell/store';
import { RepoStudioProvider } from '@/lib/app-shell/RepoStudioContext';
import { useRepoPanelVisibility } from '@/lib/app-shell/useRepoPanelVisibility';
import { useCommandFilters } from '@/components/hooks/useCommandFilters';
import { useCommandOutput } from '@/components/hooks/useCommandOutput';
import { useCommandRuns } from '@/components/hooks/useCommandRuns';
import { useEnvDoctor } from '@/components/hooks/useEnvDoctor';
import { usePlatformAuth } from '@/components/hooks/usePlatformAuth';
import { usePlanningSync } from '@/components/hooks/usePlanningSync';
import { RepoCodexControls } from '@/components/appbar/RepoCodexControls';
import { LoopCadencePanel } from '@/components/features/planning/LoopCadencePanel';
import { PlanningWorkspace } from '@/components/features/planning/PlanningWorkspace';
import { EnvWorkspace } from '@/components/features/env/EnvWorkspace';
import { CommandsWorkspace } from '@/components/features/commands/CommandsWorkspace';
import { TerminalWorkspace } from '@/components/features/commands/TerminalWorkspace';
import { DocsWorkspace } from '@/components/features/docs/DocsWorkspace';
import { AssistantWorkspace } from '@/components/features/assistant/AssistantWorkspace';
import { DiffWorkspace } from '@/components/features/diff/DiffWorkspace';
import { CodeWorkspace } from '@/components/features/code/CodeWorkspace';
import { StoryWorkspace } from '@/components/features/story/StoryWorkspace';
import { GitWorkspace } from '@/components/features/git/GitWorkspace';
import { ReviewQueueWorkspace } from '@/components/features/review-queue/ReviewQueueWorkspace';
import { RepoSettingsPanelContent } from '@/components/settings/RepoSettingsPanelContent';

const WORKSPACE_LABELS: Record<RepoWorkspaceId, string> = {
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
};

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
  const layoutRef = React.useRef<DockLayoutRef | null>(null);
  const [profile, setProfile] = React.useState('forge-agent');
  const [mode, setMode] = React.useState<RepoMode>('local');
  const [reviewQueueTrustMode, setReviewQueueTrustMode] = React.useState<'require-approval' | 'auto-approve-all'>('require-approval');
  const [reviewQueueLastAutoApplyAt, setReviewQueueLastAutoApplyAt] = React.useState('');
  const [loopAssistantPrompt, setLoopAssistantPrompt] = React.useState('');
  const [codexAssistantPrompt, setCodexAssistantPrompt] = React.useState('');
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(planning.docs[0]?.id || null);

  const activeWorkspaceId = useRepoStudioShellStore((state) => state.route.activeWorkspaceId);
  const openWorkspaceIds = useRepoStudioShellStore((state) => state.route.openWorkspaceIds);
  const workspaceHiddenPanelIds = useRepoStudioShellStore((state) => state.workspaceHiddenPanelIds);
  const setActiveWorkspace = useRepoStudioShellStore((state) => state.setActiveWorkspace);
  const openWorkspace = useRepoStudioShellStore((state) => state.openWorkspace);
  const closeWorkspace = useRepoStudioShellStore((state) => state.closeWorkspace);
  const applyWorkspacePreset = useRepoStudioShellStore((state) => state.applyWorkspacePreset);
  const setPanelVisibleForWorkspace = useRepoStudioShellStore((state) => state.setPanelVisibleForWorkspace);
  const settingsSidebarOpen = useRepoStudioShellStore((state) => state.settingsSidebarOpen);
  const setSettingsSidebarOpen = useRepoStudioShellStore((state) => state.setSettingsSidebarOpen);
  const layoutJson = useRepoStudioShellStore((state) => state.dockLayouts[REPO_STUDIO_LAYOUT_ID] || null);
  const setDockLayout = useRepoStudioShellStore((state) => state.setDockLayout);
  const clearDockLayout = useRepoStudioShellStore((state) => state.clearDockLayout);
  const replaceCommandView = useRepoStudioShellStore((state) => state.replaceCommandView);
  const replaceHiddenPanelIds = useRepoStudioShellStore((state) => state.replaceHiddenPanelIds);
  const replaceWorkspaceHiddenPanelIds = useRepoStudioShellStore((state) => state.replaceWorkspaceHiddenPanelIds);
  const activeLoopId = useRepoStudioShellStore((state) => state.activeLoopId);
  const setActiveLoopId = useRepoStudioShellStore((state) => state.setActiveLoopId);

  const {
    panelSpecs,
    visibility,
    setVisibleByPanelId,
    restoreAllPanels,
  } = useRepoPanelVisibility();

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
    if (workspaceId) {
      setPanelVisibleForWorkspace(workspaceId, panelId, visible);
    } else {
      setVisibleByPanelId(panelId, visible);
    }
    persistHiddenPanels();
  }, [persistHiddenPanels, setPanelVisibleForWorkspace, setVisibleByPanelId]);

  const restorePanelsAndPersist = React.useCallback(() => {
    restoreAllPanels();
    persistHiddenPanels();
  }, [persistHiddenPanels, restoreAllPanels]);

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
    if (workspaceHiddenPanelIds[activeWorkspaceId]) return;
    applyWorkspacePreset(activeWorkspaceId);
    persistHiddenPanels();
  }, [activeWorkspaceId, applyWorkspacePreset, persistHiddenPanels, workspaceHiddenPanelIds]);

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
    clearDockLayout(REPO_STUDIO_LAYOUT_ID);
    layoutRef.current?.resetLayout();
  }, [clearDockLayout]);

  const openWorkspaceWithPreset = React.useCallback((workspaceId: RepoWorkspaceId) => {
    openWorkspace(workspaceId);
    if (!workspaceHiddenPanelIds[workspaceId]) {
      applyWorkspacePreset(workspaceId);
      persistHiddenPanels();
    }
  }, [applyWorkspacePreset, openWorkspace, persistHiddenPanels, workspaceHiddenPanelIds]);

  const layoutMenuItems = React.useMemo(() => [
    {
      id: 'layout',
      label: 'Layout',
      icon: <LayoutPanelTop size={16} />,
      submenu: [
        ...panelSpecs.map((spec) => ({
          id: `panel-${spec.id}`,
          label: visibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
          onSelect: () => setPanelVisibleAndPersist(spec.id, !(visibility[spec.key] !== false)),
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
  ], [panelSpecs, visibility, setPanelVisibleAndPersist, restorePanelsAndPersist, resetDockLayout, setSettingsSidebarOpen]);

  const focusWorkspace = React.useCallback((workspaceId: RepoWorkspaceId, panelId?: string) => {
    openWorkspaceWithPreset(workspaceId);
    if (panelId) {
      setPanelVisibleAndPersist(panelId, true, workspaceId);
    }
  }, [openWorkspaceWithPreset, setPanelVisibleAndPersist]);

  const menus = React.useMemo(
    () => buildRepoWorkspaceMenus({
      workspaceId: activeWorkspaceId,
      openWorkspaceIds,
      nextAction: planningSnapshot.nextAction,
      onRefreshSnapshot: () => refreshLoopSnapshot(activeLoopId).catch(() => {}),
      onRunEnvDoctor: () => runEnvDoctor().catch(() => {}),
      onRunEnvReconcile: () => runEnvReconcile().catch(() => {}),
      onFocusWorkspace: focusWorkspace,
      onOpenWorkspace: openWorkspaceWithPreset,
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
      openWorkspaceWithPreset,
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
    openWorkspaceWithPreset('loop-assistant');
    setPanelVisibleAndPersist('loop-assistant', true, 'loop-assistant');
  }, [openWorkspaceWithPreset, setPanelVisibleAndPersist]);

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
                    label={WORKSPACE_LABELS[workspaceId]}
                    isActive={activeWorkspaceId === workspaceId}
                    domain="forge"
                    onSelect={() => {
                      openWorkspaceWithPreset(workspaceId);
                      setActiveWorkspace(workspaceId);
                    }}
                    onClose={
                      openWorkspaceIds.length > 1
                        ? () => closeWorkspace(workspaceId)
                        : undefined
                    }
                  />
                ))}
              </StudioApp.Tabs.Main>
              <StudioApp.Tabs.Right>
                <RepoCodexControls />
                <SidebarTrigger aria-label="Toggle settings sidebar" />
              </StudioApp.Tabs.Right>
            </StudioApp.Tabs>

            <StudioApp.Content className="min-h-0 overflow-hidden">
              <EditorDockLayout
                ref={layoutRef}
                layoutId={REPO_STUDIO_LAYOUT_ID}
                layoutJson={layoutJson}
                onLayoutChange={(json) => setDockLayout(REPO_STUDIO_LAYOUT_ID, json)}
                clearLayout={() => clearDockLayout(REPO_STUDIO_LAYOUT_ID)}
                onPanelClosed={(panelId) => setPanelVisibleAndPersist(panelId, false)}
                className="h-full"
              >
                <EditorDockLayout.Left>
                  {visibility['panel.visible.repo-loop-cadence'] !== false ? (
                    <EditorDockLayout.Panel id="loop-cadence" title="Loop Cadence" icon={<ShieldCheck size={14} />}>
                      <LoopCadencePanel
                        nextAction={planningSnapshot.nextAction}
                        onCopyText={copyText}
                        onRefresh={() => refreshLoopSnapshot(activeLoopId).catch(() => {})}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}
                </EditorDockLayout.Left>

                <EditorDockLayout.Main>
                  {visibility['panel.visible.repo-planning'] !== false ? (
                    <EditorDockLayout.Panel id="planning" title="Planning" icon={<BookOpen size={14} />}>
                      <PlanningWorkspace
                        planning={planningSnapshot}
                        loops={loopSnapshot.entries}
                        activeLoopId={activeLoopId}
                        switchingLoop={switchingLoop}
                        selectedDocId={selectedDocId}
                        onSelectDoc={setSelectedDocId}
                        onSwitchLoop={switchLoop}
                        onCopyMentionToken={copyPlanningMentionToken}
                        onCopyText={copyText}
                        onOpenAssistant={openLoopAssistant}
                        selectedDocContent={selectedDoc?.content || ''}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-commands'] !== false ? (
                    <EditorDockLayout.Panel id="commands" title="Commands" icon={<Wrench size={14} />}>
                      <CommandsWorkspace
                        commandView={commandView}
                        commandSources={commandSources}
                        filteredCommands={filteredCommands}
                        onSetView={setCommandView}
                        onRunCommand={runCommand}
                        onToggleCommand={toggleCommand}
                        onCopyText={copyText}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-story'] !== false ? (
                    <EditorDockLayout.Panel id="story" title="Story" icon={<BookOpen size={14} />}>
                      <StoryWorkspace
                        activeLoopId={activeLoopId}
                        onCopyText={copyText}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}
                </EditorDockLayout.Main>

                <EditorDockLayout.Right>
                  {visibility['panel.visible.repo-env'] !== false ? (
                    <EditorDockLayout.Panel id="env" title="Env" icon={<ShieldCheck size={14} />}>
                      <EnvWorkspace
                        profile={profile}
                        mode={mode}
                        onProfileChange={updateProfile}
                        onModeChange={updateMode}
                        envOutput={envOutput}
                        envDoctorPayload={envDoctorPayload as EnvDoctorPayload | null}
                        dependencyHealth={dependencyHealth}
                        runtimeDeps={runtimeDeps}
                        onRunDoctor={runEnvDoctor}
                        onRunReconcile={runEnvReconcile}
                        onRefreshDeps={refreshDependencyHealth}
                        onCopyText={copyText}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-loop-assistant'] !== false ? (
                    <EditorDockLayout.Panel id="loop-assistant" title="Loop Assistant" icon={<Bot size={14} />}>
                      <AssistantWorkspace
                        title="Loop Assistant"
                        editorTarget="loop-assistant"
                      />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-codex-assistant'] !== false ? (
                    <EditorDockLayout.Panel id="codex-assistant" title="Codex Assistant" icon={<Bot size={14} />}>
                      <AssistantWorkspace
                        title="Codex Assistant"
                        editorTarget="codex-assistant"
                      />
                    </EditorDockLayout.Panel>
                  ) : null}
                </EditorDockLayout.Right>

                <EditorDockLayout.Bottom>
                  {visibility['panel.visible.repo-docs'] !== false ? (
                    <EditorDockLayout.Panel id="docs" title="Docs" icon={<BookOpen size={14} />}>
                      <DocsWorkspace />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-terminal'] !== false ? (
                    <EditorDockLayout.Panel id="terminal" title="Terminal" icon={<TerminalSquare size={14} />}>
                      <TerminalWorkspace />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-diff'] !== false ? (
                    <EditorDockLayout.Panel id="diff" title="Diff" icon={<GitCompareArrows size={14} />}>
                      <DiffWorkspace
                        onCopyText={copyText}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-git'] !== false ? (
                    <EditorDockLayout.Panel id="git" title="Git" icon={<GitCompareArrows size={14} />}>
                      <GitWorkspace
                        onCopyText={copyText}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-code'] !== false ? (
                    <EditorDockLayout.Panel id="code" title="Code" icon={<TerminalSquare size={14} />}>
                      <CodeWorkspace
                        activeLoopId={activeLoopId}
                        onCopyText={copyText}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}

                  {visibility['panel.visible.repo-review-queue'] !== false ? (
                    <EditorDockLayout.Panel id="review-queue" title="Review Queue" icon={<ShieldCheck size={14} />}>
                      <ReviewQueueWorkspace
                        activeLoopId={activeLoopId}
                        onCopyText={copyText}
                      />
                    </EditorDockLayout.Panel>
                  ) : null}
                </EditorDockLayout.Bottom>
              </EditorDockLayout>
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

'use client';

import * as React from 'react';
import { BookOpen, Bot, GitCompareArrows, LayoutPanelTop, ShieldCheck, TerminalSquare, Wrench } from 'lucide-react';
import { StudioApp } from '@forge/shared/components/app';
import {
  EditorDockLayout,
  EditorMenubar,
  type DockLayoutRef,
} from '@forge/shared/components/editor';
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
  fetchRepoAuthStatus,
  fetchLoopSnapshot,
  fetchRuntimeDependencies,
  fetchSettingsSnapshot,
  connectRepoAuth,
  disconnectRepoAuth,
  runEnvDoctor as runEnvDoctorRequest,
  runEnvReconcile as runEnvReconcileRequest,
  saveCommandView,
  setActiveLoop as setActiveLoopRequest,
  stopRuntime,
  toggleCommandPolicy,
  upsertSettings,
  validateRepoAuth,
} from '@/lib/api/services';
import type { DependencyHealth, RepoAuthStatusResponse, RepoMode } from '@/lib/api/types';
import type { PlanningSnapshot, RepoCommandEntry, RepoLoopsSnapshot } from '@/lib/repo-data';
import type { RepoCommandView } from '@/lib/types';
import { getDesktopRuntimeBridge } from '@/lib/desktop-runtime';
import { buildRepoWorkspaceMenus } from '@/lib/app-shell/menu-contributions';
import { REPO_STUDIO_LAYOUT_ID, useRepoStudioShellStore } from '@/lib/app-shell/store';
import { useRepoPanelVisibility } from '@/lib/app-shell/useRepoPanelVisibility';
import { usePlanningAttachments } from '@/components/hooks/usePlanningAttachments';
import { useCommandFilters } from '@/components/hooks/useCommandFilters';
import { useCommandRuns } from '@/components/hooks/useCommandRuns';
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

function copyText(text: string) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {});
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
  const [envOutput, setEnvOutput] = React.useState('Run "Doctor" to check environment readiness.');
  const [envDoctorPayload, setEnvDoctorPayload] = React.useState<any | null>(null);
  const [dependencyHealth, setDependencyHealth] = React.useState<DependencyHealth | null>(null);
  const [platformBaseUrl, setPlatformBaseUrl] = React.useState('');
  const [platformAutoValidate, setPlatformAutoValidate] = React.useState(true);
  const [platformStatus, setPlatformStatus] = React.useState<RepoAuthStatusResponse | null>(null);
  const [platformBusy, setPlatformBusy] = React.useState(false);
  const [reviewQueueTrustMode, setReviewQueueTrustMode] = React.useState<'require-approval' | 'auto-approve-all'>('require-approval');
  const [reviewQueueLastAutoApplyAt, setReviewQueueLastAutoApplyAt] = React.useState('');
  const [planningSnapshot, setPlanningSnapshot] = React.useState(planning);
  const [loopSnapshot, setLoopSnapshot] = React.useState(loops);
  const [switchingLoop, setSwitchingLoop] = React.useState(false);
  const [attachedDiffContext, setAttachedDiffContext] = React.useState<{ label: string; content: string } | null>(null);

  const activeWorkspaceId = useRepoStudioShellStore((state) => state.route.activeWorkspaceId);
  const setActiveWorkspace = useRepoStudioShellStore((state) => state.setActiveWorkspace);
  const settingsSidebarOpen = useRepoStudioShellStore((state) => state.settingsSidebarOpen);
  const setSettingsSidebarOpen = useRepoStudioShellStore((state) => state.setSettingsSidebarOpen);
  const layoutJson = useRepoStudioShellStore((state) => state.dockLayouts[REPO_STUDIO_LAYOUT_ID] || null);
  const setDockLayout = useRepoStudioShellStore((state) => state.setDockLayout);
  const clearDockLayout = useRepoStudioShellStore((state) => state.clearDockLayout);
  const replaceCommandView = useRepoStudioShellStore((state) => state.replaceCommandView);
  const replaceHiddenPanelIds = useRepoStudioShellStore((state) => state.replaceHiddenPanelIds);
  const activeLoopId = useRepoStudioShellStore((state) => state.activeLoopId);
  const setActiveLoopId = useRepoStudioShellStore((state) => state.setActiveLoopId);

  const {
    panelSpecs,
    visibility,
    setVisibleByPanelId,
    restoreAllPanels,
  } = useRepoPanelVisibility();

  const {
    selectedDocId,
    setSelectedDocId,
    selectedDoc,
    attachedDocs,
    assistantContext,
    detachDoc,
    clearAttachedDocs,
    attachSelectedDoc,
  } = usePlanningAttachments(planningSnapshot.docs);

  const {
    commandView,
    setCommandView,
    setCommandRows,
    commandSources,
    filteredCommands,
  } = useCommandFilters(commands);

  const {
    commandOutput,
    setCommandOutput,
    confirmRuns,
    setConfirmRuns,
    activeRun,
    runCommand,
    stopActiveRun,
  } = useCommandRuns();

  const combinedAssistantContext = React.useMemo(
    () => [
      assistantContext,
      attachedDiffContext
        ? `### ${attachedDiffContext.label}\n\n\`\`\`diff\n${attachedDiffContext.content}\n\`\`\``
        : '',
    ].filter(Boolean).join('\n\n'),
    [assistantContext, attachedDiffContext],
  );

  const persistLocalSettings = React.useCallback(async (settings: Record<string, unknown>) => {
    await upsertSettings({
      scope: 'local',
      scopeId: 'default',
      workspaceId: activeWorkspaceId,
      loopId: activeLoopId,
      settings,
    });
  }, [activeLoopId, activeWorkspaceId]);

  const persistHiddenPanels = React.useCallback(() => {
    const hiddenPanelIds = useRepoStudioShellStore.getState().hiddenPanelIds;
    persistLocalSettings({
      panels: {
        hiddenPanelIds,
      },
    }).catch(() => {});
  }, [persistLocalSettings]);

  const setPanelVisibleAndPersist = React.useCallback((panelId: string, visible: boolean) => {
    setVisibleByPanelId(panelId, visible);
    persistHiddenPanels();
  }, [persistHiddenPanels, setVisibleByPanelId]);

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

  const refreshDependencyHealth = React.useCallback(async () => {
    const payload = await fetchRuntimeDependencies();
    if (payload?.deps) {
      setDependencyHealth(payload.deps as DependencyHealth);
    } else {
      setDependencyHealth(null);
    }
  }, []);

  const refreshPlatformStatus = React.useCallback(async () => {
    const payload = await fetchRepoAuthStatus();
    setPlatformStatus(payload);
    if (!platformBaseUrl && payload.baseUrl) {
      setPlatformBaseUrl(payload.baseUrl);
    }
  }, [platformBaseUrl]);

  const loadSettingsSnapshot = React.useCallback(async (workspaceId: string, loopId: string) => {
    const payload = await fetchSettingsSnapshot({ workspaceId, loopId });
    if (!payload?.ok || !payload.merged || typeof payload.merged !== 'object') return;
    const merged = payload.merged as Record<string, any>;
    const mergedEnv = merged.env && typeof merged.env === 'object' ? merged.env : {};
    const mergedCommands = merged.commands && typeof merged.commands === 'object' ? merged.commands : {};
    const mergedPanels = merged.panels && typeof merged.panels === 'object' ? merged.panels : {};
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
    if (Array.isArray(mergedPanels.hiddenPanelIds)) {
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
  }, [replaceCommandView, replaceHiddenPanelIds, setConfirmRuns]);

  const refreshLoopSnapshot = React.useCallback(async (loopId: string) => {
    const payload = await fetchLoopSnapshot(loopId);
    if (!payload.ok) {
      throw new Error(payload.message || 'Unable to refresh loop snapshot.');
    }
    if (payload.loops) {
      setLoopSnapshot(payload.loops as RepoLoopsSnapshot);
      if (payload.loops.activeLoopId) {
        setActiveLoopId(String(payload.loops.activeLoopId));
        const active = payload.loops.entries?.find((entry: any) => entry.id === payload.loops.activeLoopId);
        if (active?.profile) setProfile(String(active.profile));
      }
    }
    if (payload.planning) {
      setPlanningSnapshot(payload.planning as PlanningSnapshot);
    }
    const resolvedLoopId = String(payload?.loops?.activeLoopId || loopId || 'default');
    await loadSettingsSnapshot(activeWorkspaceId, resolvedLoopId);
  }, [activeWorkspaceId, loadSettingsSnapshot, setActiveLoopId]);

  const switchLoop = React.useCallback(async (loopId: string) => {
    if (!loopId || loopId === activeLoopId) return;
    setSwitchingLoop(true);
    try {
      const payload = await setActiveLoopRequest(loopId);
      if (!payload.ok) {
        setCommandOutput(payload.message || payload.stderr || 'Unable to switch loop.');
        setSwitchingLoop(false);
        return;
      }

      await refreshLoopSnapshot(loopId);
      setCommandOutput(payload.message || `Active loop set to ${loopId}.`);
    } catch (error) {
      setCommandOutput(toErrorMessage(error, `Unable to switch to loop ${loopId}.`));
    } finally {
      setSwitchingLoop(false);
    }
  }, [activeLoopId, refreshLoopSnapshot, setCommandOutput]);

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
        setCommandOutput((current) => (current.includes(message) ? current : `${message}\n\n${current}`));
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeLoopId, refreshLoopSnapshot, setCommandOutput]);

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

  const persistPlatformMetadata = React.useCallback((payload: RepoAuthStatusResponse, fallbackBaseUrl = '') => {
    const lastStatus = payload.connected
      ? (payload.ok === true ? 'connected' : 'error')
      : 'disconnected';
    persistLocalSettings({
      platform: {
        baseUrl: payload.baseUrl || fallbackBaseUrl || platformBaseUrl,
        autoValidate: platformAutoValidate,
        lastStatus,
        lastValidatedAt: payload.lastValidatedAt || '',
      },
    }).catch(() => {});
  }, [persistLocalSettings, platformAutoValidate, platformBaseUrl]);

  const updatePlatformBaseUrl = React.useCallback((value: string) => {
    setPlatformBaseUrl(value);
    persistLocalSettings({
      platform: {
        baseUrl: value,
        autoValidate: platformAutoValidate,
      },
    }).catch(() => {});
  }, [persistLocalSettings, platformAutoValidate]);

  const updatePlatformAutoValidate = React.useCallback((value: boolean) => {
    setPlatformAutoValidate(value);
    persistLocalSettings({
      platform: {
        baseUrl: platformBaseUrl,
        autoValidate: value,
      },
    }).catch(() => {});
  }, [persistLocalSettings, platformBaseUrl]);

  const connectPlatform = React.useCallback(async (input: { baseUrl: string; token: string }) => {
    setPlatformBusy(true);
    try {
      const payload = await connectRepoAuth({
        baseUrl: input.baseUrl,
        token: input.token,
      });
      setPlatformStatus(payload);
      if (payload.baseUrl) setPlatformBaseUrl(payload.baseUrl);
      persistPlatformMetadata(payload, input.baseUrl);
      if (platformAutoValidate && payload.ok) {
        const next = await validateRepoAuth();
        setPlatformStatus(next);
        persistPlatformMetadata(next, payload.baseUrl || input.baseUrl);
      }
      setCommandOutput(payload.message || (payload.ok ? 'Platform connected.' : 'Platform connection failed.'));
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to connect platform.'));
    } finally {
      setPlatformBusy(false);
    }
  }, [persistPlatformMetadata, platformAutoValidate, setCommandOutput]);

  const validatePlatform = React.useCallback(async (input: { baseUrl?: string; token?: string } = {}) => {
    setPlatformBusy(true);
    try {
      const payload = await validateRepoAuth(input);
      setPlatformStatus(payload);
      if (payload.baseUrl) setPlatformBaseUrl(payload.baseUrl);
      persistPlatformMetadata(payload, input.baseUrl || platformBaseUrl);
      setCommandOutput(payload.message || (payload.ok ? 'Platform connection validated.' : 'Platform validation failed.'));
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to validate platform connection.'));
    } finally {
      setPlatformBusy(false);
    }
  }, [persistPlatformMetadata, platformBaseUrl, setCommandOutput]);

  const disconnectPlatform = React.useCallback(async () => {
    setPlatformBusy(true);
    try {
      const payload = await disconnectRepoAuth();
      setPlatformStatus(payload);
      persistPlatformMetadata(payload, platformBaseUrl);
      setCommandOutput(payload.message || 'Platform disconnected.');
    } catch (error) {
      setCommandOutput(toErrorMessage(error, 'Unable to disconnect platform connection.'));
    } finally {
      setPlatformBusy(false);
    }
  }, [persistPlatformMetadata, platformBaseUrl, setCommandOutput]);

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

  const runEnvDoctor = React.useCallback(async () => {
    try {
      const payload = await runEnvDoctorRequest({ profile, mode });
      setEnvDoctorPayload(payload.payload || null);
      const lines = [
        payload.report || '',
        payload.stderr || '',
        payload.resolvedAttempt ? `resolved: ${payload.resolvedAttempt}` : '',
      ].filter(Boolean);
      setEnvOutput(lines.join('\n\n') || 'No env output.');
    } catch (error) {
      setEnvOutput(toErrorMessage(error, 'Unable to run env doctor.'));
    }
  }, [mode, profile]);

  const runEnvReconcile = React.useCallback(async () => {
    try {
      const payload = await runEnvReconcileRequest({ profile, mode });
      const lines = [
        payload.report || payload.stdout || '',
        payload.stderr || '',
        payload.command ? `command: ${payload.command}` : '',
        payload.resolvedAttempt ? `resolved: ${payload.resolvedAttempt}` : '',
      ].filter(Boolean);
      setEnvOutput(lines.join('\n\n') || 'No env output.');
      await runEnvDoctor();
      await refreshDependencyHealth();
    } catch (error) {
      setEnvOutput(toErrorMessage(error, 'Unable to run env reconcile.'));
    }
  }, [mode, profile, refreshDependencyHealth, runEnvDoctor]);

  const resetDockLayout = React.useCallback(() => {
    clearDockLayout(REPO_STUDIO_LAYOUT_ID);
    layoutRef.current?.resetLayout();
  }, [clearDockLayout]);

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

  const focusWorkspace = React.useCallback((workspaceId: typeof activeWorkspaceId, panelId?: string) => {
    setActiveWorkspace(workspaceId);
    if (panelId) {
      setPanelVisibleAndPersist(panelId, true);
    }
  }, [setActiveWorkspace, setPanelVisibleAndPersist]);

  const menus = React.useMemo(
    () => buildRepoWorkspaceMenus({
      workspaceId: activeWorkspaceId,
      nextAction: planningSnapshot.nextAction,
      onRefreshSnapshot: () => refreshLoopSnapshot(activeLoopId).catch(() => {}),
      onRunEnvDoctor: () => runEnvDoctor().catch(() => {}),
      onRunEnvReconcile: () => runEnvReconcile().catch(() => {}),
      onFocusWorkspace: focusWorkspace,
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
      planningSnapshot.nextAction,
      refreshLoopSnapshot,
      runEnvDoctor,
      runEnvReconcile,
    ],
  );

  const openAssistantWithDoc = React.useCallback(() => {
    attachSelectedDoc();
    setActiveWorkspace('loop-assistant');
    setPanelVisibleAndPersist('loop-assistant', true);
  }, [attachSelectedDoc, setActiveWorkspace, setPanelVisibleAndPersist]);

  const attachDiffToAssistant = React.useCallback((label: string, content: string) => {
    setAttachedDiffContext({ label, content });
    setActiveWorkspace('codex-assistant');
    setPanelVisibleAndPersist('codex-assistant', true);
  }, [setActiveWorkspace, setPanelVisibleAndPersist]);

  return (
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
              <StudioApp.Tab
                label={`RepoStudio - ${activeWorkspaceId}`}
                isActive
                domain="forge"
                onSelect={() => {}}
              />
            </StudioApp.Tabs.Main>
            <StudioApp.Tabs.Right>
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
                      onAttachSelected={openAssistantWithDoc}
                      onCopyText={copyText}
                      onOpenAssistant={() => setActiveWorkspace('loop-assistant')}
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
                      onAttachToAssistant={attachDiffToAssistant}
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
                      envDoctorPayload={envDoctorPayload}
                      dependencyHealth={dependencyHealth}
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
                      attachedDocs={attachedDocs}
                      assistantContext={combinedAssistantContext}
                      onDetachDoc={detachDoc}
                      onCopyText={copyText}
                      onClearAttachments={clearAttachedDocs}
                    />
                  </EditorDockLayout.Panel>
                ) : null}

                {visibility['panel.visible.repo-codex-assistant'] !== false ? (
                  <EditorDockLayout.Panel id="codex-assistant" title="Codex Assistant" icon={<Bot size={14} />}>
                    <AssistantWorkspace
                      title="Codex Assistant"
                      editorTarget="codex-assistant"
                      attachedDocs={attachedDocs}
                      assistantContext={combinedAssistantContext}
                      onDetachDoc={detachDoc}
                      onCopyText={copyText}
                      onClearAttachments={clearAttachedDocs}
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
                    <TerminalWorkspace
                      commandOutput={commandOutput}
                      hasActiveRun={Boolean(activeRun)}
                      onClear={() => setCommandOutput('No command run yet.')}
                      onStop={stopActiveRun}
                    />
                  </EditorDockLayout.Panel>
                ) : null}

                {visibility['panel.visible.repo-diff'] !== false ? (
                  <EditorDockLayout.Panel id="diff" title="Diff" icon={<GitCompareArrows size={14} />}>
                    <DiffWorkspace
                      onAttachToAssistant={attachDiffToAssistant}
                      onCopyText={copyText}
                    />
                  </EditorDockLayout.Panel>
                ) : null}

                {visibility['panel.visible.repo-git'] !== false ? (
                  <EditorDockLayout.Panel id="git" title="Git" icon={<GitCompareArrows size={14} />}>
                    <GitWorkspace
                      onAttachToAssistant={attachDiffToAssistant}
                      onCopyText={copyText}
                    />
                  </EditorDockLayout.Panel>
                ) : null}

                {visibility['panel.visible.repo-code'] !== false ? (
                  <EditorDockLayout.Panel id="code" title="Code" icon={<TerminalSquare size={14} />}>
                    <CodeWorkspace
                      activeLoopId={activeLoopId}
                      onAttachToAssistant={attachDiffToAssistant}
                      onCopyText={copyText}
                    />
                  </EditorDockLayout.Panel>
                ) : null}

                {visibility['panel.visible.repo-review-queue'] !== false ? (
                  <EditorDockLayout.Panel id="review-queue" title="Review Queue" icon={<ShieldCheck size={14} />}>
                    <ReviewQueueWorkspace
                      activeLoopId={activeLoopId}
                      onAttachToAssistant={attachDiffToAssistant}
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
          <h2 className="text-sm font-semibold">Settings</h2>
          <p className="text-xs text-muted-foreground">
            Right sidebar is reserved for settings/codegen only.
          </p>
        </SidebarHeader>
        <SidebarContent>
          <RepoSettingsPanelContent
            profile={profile}
            mode={mode}
            confirmRuns={confirmRuns}
            reviewQueueTrustMode={reviewQueueTrustMode}
            reviewQueueLastAutoApplyAt={reviewQueueLastAutoApplyAt}
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
            onPlatformBaseUrlChange={updatePlatformBaseUrl}
            onPlatformAutoValidateChange={updatePlatformAutoValidate}
            onPlatformConnect={connectPlatform}
            onPlatformValidate={validatePlatform}
            onPlatformDisconnect={disconnectPlatform}
            onSetPanelVisible={setPanelVisibleAndPersist}
            onRestorePanels={restorePanelsAndPersist}
            onStopRuntime={stopRepoStudioRuntime}
          />
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

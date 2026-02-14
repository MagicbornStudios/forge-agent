'use client';

import * as React from 'react';
import { BookOpen, Bot, GitCompareArrows, LayoutPanelTop, ShieldCheck, TerminalSquare, Wrench } from 'lucide-react';
import { StudioApp } from '@forge/shared/components/app';
import {
  createEditorMenubarMenus,
  EditorDockLayout,
  EditorFileMenu,
  EditorHelpMenu,
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
import type { DependencyHealth } from '@/lib/dependency-health';
import type { PlanningSnapshot, RepoCommandEntry, RepoLoopsSnapshot } from '@/lib/repo-data';
import type { RepoCommandView } from '@/lib/types';
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
  const [mode, setMode] = React.useState<'local' | 'preview' | 'production' | 'headless'>('local');
  const [envOutput, setEnvOutput] = React.useState('Run "Doctor" to check environment readiness.');
  const [envDoctorPayload, setEnvDoctorPayload] = React.useState<any | null>(null);
  const [dependencyHealth, setDependencyHealth] = React.useState<DependencyHealth | null>(null);
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
    commandRows,
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

  const refreshCommands = React.useCallback(async () => {
    const response = await fetch('/api/repo/commands/list');
    const payload = await response.json().catch(() => ({}));
    if (Array.isArray(payload.commands)) {
      setCommandRows(payload.commands as typeof commandRows);
    }
    if (payload.commandView && typeof payload.commandView === 'object') {
      replaceCommandView(payload.commandView as RepoCommandView);
    }
  }, [replaceCommandView, setCommandRows]);

  const refreshDependencyHealth = React.useCallback(async () => {
    const response = await fetch('/api/repo/runtime/deps');
    const payload = await response.json().catch(() => ({ ok: false }));
    if (payload?.deps) {
      setDependencyHealth(payload.deps as DependencyHealth);
    } else {
      setDependencyHealth(null);
    }
  }, []);

  const refreshLoopSnapshot = React.useCallback(async (loopId: string) => {
    const response = await fetch(`/api/repo/loops/snapshot?loopId=${encodeURIComponent(loopId)}`);
    const payload = await response.json().catch(() => ({ ok: false }));
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
  }, [setActiveLoopId]);

  const switchLoop = React.useCallback(async (loopId: string) => {
    if (!loopId || loopId === activeLoopId) return;
    setSwitchingLoop(true);
    try {
      const response = await fetch('/api/repo/loops/use', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ loopId }),
      });
      const payload = await response.json().catch(() => ({ ok: false }));
      if (!payload.ok) {
        setCommandOutput(payload.message || payload.stderr || 'Unable to switch loop.');
        setSwitchingLoop(false);
        return;
      }

      await refreshLoopSnapshot(loopId);
      setCommandOutput(payload.message || `Active loop set to ${loopId}.`);
    } catch (error: any) {
      setCommandOutput(String(error?.message || error));
    } finally {
      setSwitchingLoop(false);
    }
  }, [activeLoopId, refreshLoopSnapshot, setCommandOutput]);

  React.useEffect(() => {
    setActiveLoopId(loops.activeLoopId);
    const active = loops.entries.find((entry) => entry.id === loops.activeLoopId);
    if (active?.profile) setProfile(active.profile);
    refreshCommands().catch(() => {});
    refreshDependencyHealth().catch(() => {});
    refreshLoopSnapshot(loops.activeLoopId).catch(() => {});
  }, [loops.activeLoopId, loops.entries, refreshCommands, refreshDependencyHealth, refreshLoopSnapshot, setActiveLoopId]);

  React.useEffect(() => {
    fetch('/api/repo/commands/view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(commandView),
    }).catch(() => {});
  }, [commandView]);

  const toggleCommand = React.useCallback(async (commandId: string, disabled: boolean) => {
    const response = await fetch('/api/repo/commands/toggle', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ commandId, disabled }),
    });
    const payload = await response.json().catch(() => ({}));
    if (payload.ok) {
      await refreshCommands();
    } else {
      setCommandOutput([
        payload.message || 'Unable to update command policy.',
        payload.stderr || '',
      ].filter(Boolean).join('\n\n'));
    }
  }, [refreshCommands, setCommandOutput]);

  const stopRepoStudioRuntime = React.useCallback(async () => {
    const response = await fetch('/api/repo/runtime/stop', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const payload = await response.json().catch(() => ({ ok: false, message: 'Invalid response.' }));
    setCommandOutput([
      payload.message || 'No stop message.',
      payload.stdout || '',
      payload.stderr || '',
    ].filter(Boolean).join('\n\n'));
  }, [setCommandOutput]);

  const runEnvDoctor = React.useCallback(async () => {
    const response = await fetch('/api/env/doctor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profile, mode }),
    });
    const payload = await response.json().catch(() => ({ ok: false, message: 'Invalid response.' }));
    setEnvDoctorPayload(payload.payload || null);
    const lines = [
      payload.report || '',
      payload.stderr || '',
      payload.resolvedAttempt ? `resolved: ${payload.resolvedAttempt}` : '',
    ].filter(Boolean);
    setEnvOutput(lines.join('\n\n') || 'No env output.');
  }, [mode, profile]);

  const runEnvReconcile = React.useCallback(async () => {
    const response = await fetch('/api/env/reconcile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profile, mode }),
    });
    const payload = await response.json().catch(() => ({ ok: false, message: 'Invalid response.' }));
    const lines = [
      payload.report || payload.stdout || '',
      payload.stderr || '',
      payload.command ? `command: ${payload.command}` : '',
      payload.resolvedAttempt ? `resolved: ${payload.resolvedAttempt}` : '',
    ].filter(Boolean);
    setEnvOutput(lines.join('\n\n') || 'No env output.');
    await runEnvDoctor();
    await refreshDependencyHealth();
  }, [mode, profile, refreshDependencyHealth, runEnvDoctor]);

  const resetDockLayout = React.useCallback(() => {
    clearDockLayout(REPO_STUDIO_LAYOUT_ID);
    layoutRef.current?.resetLayout();
  }, [clearDockLayout]);

  const viewMenuItems = React.useMemo(() => {
    const layoutSubmenu = [
      ...panelSpecs.map((spec) => ({
        id: `panel-${spec.id}`,
        label: visibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
        onSelect: () => setVisibleByPanelId(spec.id, !(visibility[spec.key] !== false)),
      })),
      { id: 'view-sep-layout', type: 'separator' as const },
      {
        id: 'restore-all-panels',
        label: 'Restore all panels',
        onSelect: () => restoreAllPanels(),
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
    ];

    return [
      {
        id: 'layout',
        label: 'Layout',
        icon: <LayoutPanelTop size={16} />,
        submenu: layoutSubmenu,
      },
    ];
  }, [panelSpecs, visibility, setVisibleByPanelId, restoreAllPanels, resetDockLayout, setSettingsSidebarOpen]);

  const menus = React.useMemo(
    () =>
      createEditorMenubarMenus({
        file: [
          EditorFileMenu.New(),
          EditorFileMenu.Separator('file-sep-1'),
          { id: 'file-refresh', label: 'Refresh snapshot', onSelect: () => window.location.reload() },
        ],
        view: viewMenuItems,
        help: [
          EditorHelpMenu.Welcome(),
          EditorHelpMenu.About(),
        ],
      }),
    [viewMenuItems],
  );

  const openAssistantWithDoc = React.useCallback(() => {
    attachSelectedDoc();
    setActiveWorkspace('loop-assistant');
    setVisibleByPanelId('loop-assistant', true);
  }, [attachSelectedDoc, setActiveWorkspace, setVisibleByPanelId]);

  const attachDiffToAssistant = React.useCallback((label: string, content: string) => {
    setAttachedDiffContext({ label, content });
    setActiveWorkspace('codex-assistant');
    setVisibleByPanelId('codex-assistant', true);
  }, [setActiveWorkspace, setVisibleByPanelId]);

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
              onPanelClosed={(panelId) => setVisibleByPanelId(panelId, false)}
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
                      onProfileChange={setProfile}
                      onModeChange={setMode}
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
            panelSpecs={panelSpecs}
            panelVisibility={visibility}
            onProfileChange={setProfile}
            onModeChange={setMode}
            onConfirmRunsChange={setConfirmRuns}
            onSetPanelVisible={setVisibleByPanelId}
            onRestorePanels={restoreAllPanels}
            onStopRuntime={stopRepoStudioRuntime}
          />
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

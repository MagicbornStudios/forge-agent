'use client';

import * as React from 'react';
import { BookOpen, Bot, LayoutPanelTop, ShieldCheck, TerminalSquare, Wrench } from 'lucide-react';
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
import type { PlanningSnapshot, RepoCommandEntry } from '@/lib/repo-data';
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
import { RepoSettingsPanelContent } from '@/components/settings/RepoSettingsPanelContent';

function copyText(text: string) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {});
}

export function RepoStudioShell({
  commands,
  planning,
}: {
  commands: RepoCommandEntry[];
  planning: PlanningSnapshot;
}) {
  const layoutRef = React.useRef<DockLayoutRef | null>(null);
  const [profile, setProfile] = React.useState('forge-agent');
  const [mode, setMode] = React.useState<'local' | 'preview' | 'production' | 'headless'>('local');
  const [envOutput, setEnvOutput] = React.useState('Run "Doctor" to check environment readiness.');
  const [dependencyHealth, setDependencyHealth] = React.useState<DependencyHealth | null>(null);

  const activeWorkspaceId = useRepoStudioShellStore((state) => state.route.activeWorkspaceId);
  const setActiveWorkspace = useRepoStudioShellStore((state) => state.setActiveWorkspace);
  const settingsSidebarOpen = useRepoStudioShellStore((state) => state.settingsSidebarOpen);
  const setSettingsSidebarOpen = useRepoStudioShellStore((state) => state.setSettingsSidebarOpen);
  const layoutJson = useRepoStudioShellStore((state) => state.dockLayouts[REPO_STUDIO_LAYOUT_ID] || null);
  const setDockLayout = useRepoStudioShellStore((state) => state.setDockLayout);
  const clearDockLayout = useRepoStudioShellStore((state) => state.clearDockLayout);
  const replaceCommandView = useRepoStudioShellStore((state) => state.replaceCommandView);

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
    attachDoc,
    detachDoc,
    clearAttachedDocs,
    attachSelectedDoc,
  } = usePlanningAttachments(planning.docs);

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

  React.useEffect(() => {
    refreshCommands().catch(() => {});
    refreshDependencyHealth().catch(() => {});
  }, [refreshCommands, refreshDependencyHealth]);

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
    await refreshDependencyHealth();
  }, [mode, profile, refreshDependencyHealth]);

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
    setActiveWorkspace('assistant');
    setVisibleByPanelId('assistant', true);
  }, [attachSelectedDoc, setActiveWorkspace, setVisibleByPanelId]);

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
                      nextAction={planning.nextAction}
                      onCopyText={copyText}
                      onRefresh={() => window.location.reload()}
                    />
                  </EditorDockLayout.Panel>
                ) : null}
              </EditorDockLayout.Left>

              <EditorDockLayout.Main>
                {visibility['panel.visible.repo-planning'] !== false ? (
                  <EditorDockLayout.Panel id="planning" title="Planning" icon={<BookOpen size={14} />}>
                    <PlanningWorkspace
                      planning={planning}
                      selectedDocId={selectedDocId}
                      onSelectDoc={setSelectedDocId}
                      onAttachSelected={openAssistantWithDoc}
                      onCopyText={copyText}
                      onOpenAssistant={() => setActiveWorkspace('assistant')}
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
                      dependencyHealth={dependencyHealth}
                      onRunDoctor={runEnvDoctor}
                      onRunReconcile={runEnvReconcile}
                      onRefreshDeps={refreshDependencyHealth}
                      onCopyText={copyText}
                    />
                  </EditorDockLayout.Panel>
                ) : null}

                {visibility['panel.visible.repo-assistant'] !== false ? (
                  <EditorDockLayout.Panel id="assistant" title="Assistant" icon={<Bot size={14} />}>
                    <AssistantWorkspace
                      attachedDocs={attachedDocs}
                      assistantContext={assistantContext}
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


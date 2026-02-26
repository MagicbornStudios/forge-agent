'use client';

import * as React from 'react';
import { BookOpen, Bot, FileText, Layers, ListTodo } from 'lucide-react';
import { WorkspaceLayout, WorkspaceToolbar } from '@forge/shared/components/workspace';
import { Badge } from '@forge/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import { PhasesPanel } from '@/components/features/planning/PhasesPanel';
import { PlanningDocListPanel } from '@/components/features/planning/PlanningDocListPanel';
import { PlanningDocPagePanel } from '@/components/features/planning/PlanningDocPagePanel';
import { TasksPanel } from '@/components/features/planning/TasksPanel';
import { WorkspaceViewport } from '@/components/viewport/WorkspaceViewport';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'planning' as const;
export const WORKSPACE_LABEL = 'Planning';

function getPlanningDocTitle(doc: { filePath: string; id: string }) {
  const path = String(doc?.filePath ?? doc?.id ?? '').trim();
  if (!path) return 'Document';
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

function panelIdsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export function PlanningWorkspace({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
  panelContext,
}: RepoWorkspaceProps) {
  const hiddenPanels = React.useMemo(() => createHiddenPanelSet(hiddenPanelIds), [hiddenPanelIds]);
  const {
    planningSnapshot,
    loopEntries,
    activeLoopId,
    onSwitchLoop,
    selectedDocId,
    onSelectDoc,
  } = panelContext;

  const viewportStateKey = React.useMemo(
    () => `${layoutId}::loop::${activeLoopId}`,
    [layoutId, activeLoopId],
  );
  const viewportState = useRepoStudioShellStore((s) => s.viewportState[viewportStateKey]);
  const setViewportState = useRepoStudioShellStore((s) => s.setViewportState);

  const docIdSet = React.useMemo(
    () => new Set(planningSnapshot.docs.map((d) => d.id)),
    [planningSnapshot.docs],
  );

  const openPanelIds = React.useMemo(() => {
    const raw = viewportState?.openIds ?? [];
    return raw.filter((id) => docIdSet.has(id));
  }, [viewportState?.openIds, docIdSet]);

  const activePanelId = React.useMemo(() => {
    if (!viewportState?.activeId) return openPanelIds[0] ?? null;
    return openPanelIds.includes(viewportState.activeId) ? viewportState.activeId : openPanelIds[0] ?? null;
  }, [openPanelIds, viewportState?.activeId]);

  React.useEffect(() => {
    const rawOpen = viewportState?.openIds ?? [];
    const validOpen = rawOpen.filter((id) => docIdSet.has(id));
    const nextActive =
      activePanelId && validOpen.includes(activePanelId) ? activePanelId : validOpen[0] ?? null;
    if (!panelIdsEqual(validOpen, rawOpen) || nextActive !== activePanelId) {
      setViewportState(viewportStateKey, {
        openIds: validOpen,
        activeId: nextActive,
      });
    }
  }, [activePanelId, docIdSet, viewportState?.openIds, setViewportState, viewportStateKey]);

  React.useEffect(() => {
    if (openPanelIds.length === 0) {
      if (activePanelId !== null) {
        setViewportState(viewportStateKey, { activeId: null });
      }
      return;
    }
    if (!activePanelId) {
      setViewportState(viewportStateKey, { activeId: openPanelIds[0] });
    }
  }, [activePanelId, openPanelIds, setViewportState, viewportStateKey]);

  const openPlanningDoc = React.useCallback(
    (docId: string) => {
      if (!docId || !docIdSet.has(docId)) return;
      const nextOpen = openPanelIds.includes(docId) ? openPanelIds : [...openPanelIds, docId];
      setViewportState(viewportStateKey, {
        openIds: nextOpen,
        activeId: docId,
      });
      onSelectDoc(docId);
    },
    [docIdSet, openPanelIds, onSelectDoc, setViewportState, viewportStateKey],
  );

  const handleViewportOpenChange = React.useCallback(
    (openIds: string[]) => {
      setViewportState(viewportStateKey, { openIds });
    },
    [setViewportState, viewportStateKey],
  );

  const handleViewportActiveChange = React.useCallback(
    (activeId: string | null) => {
      setViewportState(viewportStateKey, { activeId });
      if (activeId) onSelectDoc(activeId);
    },
    [onSelectDoc, setViewportState, viewportStateKey],
  );

  const viewportPanels = React.useMemo(
    () =>
      openPanelIds
        .map((docId) => {
          const doc = planningSnapshot.docs.find((d) => d.id === docId);
          if (!doc) return null;
          return {
            id: docId,
            title: getPlanningDocTitle(doc),
            icon: <FileText size={14} />,
            content: (
              <PlanningDocPagePanel
                docId={docId}
                planning={planningSnapshot}
              />
            ),
          };
        })
        .filter((panel): panel is NonNullable<typeof panel> => panel != null),
    [openPanelIds, planningSnapshot],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <WorkspaceToolbar className="shrink-0 border-b border-border px-2 py-1">
        <WorkspaceToolbar.Left>
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="shrink-0 text-muted-foreground" aria-hidden />
            <Select value={activeLoopId} onValueChange={onSwitchLoop}>
              <SelectTrigger className="h-7 w-[180px] text-xs">
                <SelectValue placeholder="Loop" />
              </SelectTrigger>
              <SelectContent>
                {loopEntries.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.name} ({entry.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Center>
          <span
            className="max-w-[50vw] truncate text-xs text-muted-foreground"
            title={planningSnapshot.nextAction}
          >
            {planningSnapshot.nextAction || '—'}
          </span>
        </WorkspaceToolbar.Center>
        <WorkspaceToolbar.Right>
          <Badge variant="secondary" className="font-normal">
            {planningSnapshot.percent}% · {planningSnapshot.rows.length} phases
          </Badge>
          <Badge variant="outline" className="font-normal">
            {planningSnapshot.tasks.filter((t) => String(t.status || '').toLowerCase().replace(/\s+/g, '-') !== 'complete').length} open tasks
          </Badge>
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>
      <WorkspaceLayout
        layoutId={layoutId}
        layoutJson={layoutJson}
        onLayoutChange={onLayoutChange}
        clearLayout={clearLayout}
        onPanelClosed={onPanelClosed}
        className="min-h-0 flex-1"
      >
        <WorkspaceLayout.Left>
          <WorkspaceLayout.Panel id="planning-phases" title="Phases" icon={<Layers size={14} />}>
            <PhasesPanel planning={planningSnapshot} />
          </WorkspaceLayout.Panel>
          <WorkspaceLayout.Panel id="planning-tasks" title="Tasks" icon={<ListTodo size={14} />}>
            <TasksPanel planning={planningSnapshot} />
          </WorkspaceLayout.Panel>
          <WorkspaceLayout.Panel id="planning-documents" title="Documents" icon={<FileText size={14} />}>
            <PlanningDocListPanel
              planning={planningSnapshot}
              selectedDocId={selectedDocId}
              onOpenDoc={openPlanningDoc}
            />
          </WorkspaceLayout.Panel>
        </WorkspaceLayout.Left>
        <WorkspaceLayout.Main hideTabBar>
          <WorkspaceLayout.Panel id="viewport" title="Viewport" icon={<FileText size={14} />}>
            <WorkspaceViewport
              panels={viewportPanels}
              openIds={openPanelIds}
              activeId={activePanelId}
              onOpenChange={handleViewportOpenChange}
              onActiveChange={handleViewportActiveChange}
              allowEmpty
              emptyState={
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Open a planning document from the Documents panel.
                </div>
              }
            />
          </WorkspaceLayout.Panel>
        </WorkspaceLayout.Main>
        <WorkspaceLayout.Right hideTabBar>
          {isPanelVisible(hiddenPanels, 'assistant') ? (
            <WorkspaceLayout.Panel id="assistant" title="Assistant" icon={<Bot size={14} />}>
              <AssistantPanel defaultRuntime="forge" />
            </WorkspaceLayout.Panel>
          ) : null}
        </WorkspaceLayout.Right>
      </WorkspaceLayout>
    </div>
  );
}

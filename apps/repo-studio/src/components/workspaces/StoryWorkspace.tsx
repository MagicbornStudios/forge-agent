'use client';

import * as React from 'react';
import { BookOpen, Bot } from 'lucide-react';
import { WorkspaceLayout, WorkspaceToolbar } from '@forge/shared/components/workspace';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import {
  getStoryPathFromViewportPanelId,
  getStoryViewportPanelId,
  StoryExplorerPanel,
  StoryPagePanel,
  useStoryWorkspaceModel,
} from '@/components/features/story/StoryPanel';
import { WorkspaceViewport } from '@/components/viewport/WorkspaceViewport';
import { WORKSPACE_LABELS } from '@/lib/app-spec.generated';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'story' as const;
export const WORKSPACE_LABEL = 'Story';

function normalizeStoryViewportPanelIds(panelIds: string[] | undefined) {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const panelId of panelIds || []) {
    const path = getStoryPathFromViewportPanelId(panelId);
    if (!path) continue;
    const normalizedId = getStoryViewportPanelId(path);
    if (seen.has(normalizedId)) continue;
    seen.add(normalizedId);
    next.push(normalizedId);
  }
  return next;
}

function panelIdsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function getStoryTabTitle(path: string) {
  const normalized = String(path || '').trim();
  if (!normalized) return 'Page';
  const parts = normalized.split('/');
  return parts[parts.length - 1] || normalized;
}

export function StoryWorkspace({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
  panelContext,
}: RepoWorkspaceProps) {
  const hiddenPanels = React.useMemo(() => createHiddenPanelSet(hiddenPanelIds), [hiddenPanelIds]);
  const model = useStoryWorkspaceModel({ activeLoopId: panelContext.activeLoopId });

  const { activeLoopId } = panelContext;
  const viewportStateKey = React.useMemo(
    () => `${layoutId}::loop::${activeLoopId}`,
    [layoutId, activeLoopId],
  );
  const viewportState = useRepoStudioShellStore((s) => s.viewportState[viewportStateKey]);
  const setViewportState = useRepoStudioShellStore((s) => s.setViewportState);

  const openPanelIds = React.useMemo(
    () => normalizeStoryViewportPanelIds(viewportState?.openIds),
    [viewportState?.openIds],
  );

  const activePanelId = React.useMemo(() => {
    if (!viewportState?.activeId) return null;
    const normalized = normalizeStoryViewportPanelIds([viewportState.activeId])[0] || null;
    if (!normalized) return null;
    return openPanelIds.includes(normalized) ? normalized : null;
  }, [openPanelIds, viewportState?.activeId]);

  React.useEffect(() => {
    if (!model.hasLoadedTree) return;

    model.pruneDrafts(model.pagePathSet);

    const validOpen = openPanelIds.filter((panelId) => {
      const path = getStoryPathFromViewportPanelId(panelId);
      return Boolean(path && model.pagePathSet.has(path));
    });
    const nextActive = activePanelId && validOpen.includes(activePanelId)
      ? activePanelId
      : (validOpen[0] || null);

    if (!panelIdsEqual(validOpen, openPanelIds) || nextActive !== activePanelId) {
      setViewportState(viewportStateKey, {
        openIds: validOpen,
        activeId: nextActive,
      });
    }
  }, [activePanelId, model, openPanelIds, setViewportState, viewportStateKey]);

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

  const openStoryPath = React.useCallback((path: string) => {
    if (!path) return;
    const panelId = getStoryViewportPanelId(path);
    const nextOpen = openPanelIds.includes(panelId)
      ? openPanelIds
      : [...openPanelIds, panelId];
    setViewportState(viewportStateKey, {
      openIds: nextOpen,
      activeId: panelId,
    });
    model.setSelectedPath(path);
    void model.openPageDraft(path);
  }, [model, openPanelIds, setViewportState, viewportStateKey]);

  const handleViewportOpenChange = React.useCallback((nextOpenIds: string[]) => {
    const normalizedNextOpenIds = normalizeStoryViewportPanelIds(nextOpenIds);
    const nextSet = new Set(normalizedNextOpenIds);
    for (const panelId of openPanelIds) {
      if (nextSet.has(panelId)) continue;
      const path = getStoryPathFromViewportPanelId(panelId);
      if (path) model.dropDraft(path);
    }
    setViewportState(viewportStateKey, { openIds: normalizedNextOpenIds });
  }, [model, openPanelIds, setViewportState, viewportStateKey]);

  const handleViewportActiveChange = React.useCallback((nextActiveId: string | null) => {
    const normalizedActiveId = nextActiveId
      ? normalizeStoryViewportPanelIds([nextActiveId])[0] || null
      : null;
    setViewportState(viewportStateKey, { activeId: normalizedActiveId });

    const activePath = getStoryPathFromViewportPanelId(normalizedActiveId);
    if (activePath) {
      model.setSelectedPath(activePath);
      void model.openPageDraft(activePath);
    }
  }, [model, setViewportState, viewportStateKey]);

  const handleBeforeCloseTab = React.useCallback((panelId: string) => {
    const path = getStoryPathFromViewportPanelId(panelId);
    if (!path) return true;
    return model.confirmClosePath(path);
  }, [model]);

  const viewportPanels = React.useMemo(
    () => openPanelIds
      .map((panelId) => {
        const path = getStoryPathFromViewportPanelId(panelId);
        if (!path) return null;
        return {
          id: panelId,
          title: getStoryTabTitle(path),
          icon: <BookOpen size={14} />,
          content: (
            <StoryPagePanel
              model={model}
              path={path}
              onCopyText={panelContext.onCopyText}
            />
          ),
        };
      })
      .filter((panel): panel is NonNullable<typeof panel> => panel != null),
    [model, openPanelIds, panelContext.onCopyText],
  );

  const { loopEntries, onSwitchLoop } = panelContext;
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
          <span className="text-xs text-muted-foreground">
            {WORKSPACE_LABELS.story}
          </span>
        </WorkspaceToolbar.Center>
      </WorkspaceToolbar>
      <WorkspaceLayout
        layoutId={layoutId}
        layoutJson={layoutJson}
        onLayoutChange={onLayoutChange}
        clearLayout={clearLayout}
        onPanelClosed={onPanelClosed}
        className="min-h-0 flex-1"
      >
      <WorkspaceLayout.Left hideTabBar>
        {isPanelVisible(hiddenPanels, 'story') ? (
          <WorkspaceLayout.Panel id="story" title="Story" icon={<BookOpen size={14} />}>
            <StoryExplorerPanel
              model={model}
              onOpenPath={openStoryPath}
            />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Left>

      <WorkspaceLayout.Main hideTabBar>
        <WorkspaceLayout.Panel id="viewport" title="Viewport" icon={<BookOpen size={14} />}>
          <WorkspaceViewport
            panels={viewportPanels}
            openIds={openPanelIds}
            activeId={activePanelId}
            onOpenChange={handleViewportOpenChange}
            onActiveChange={handleViewportActiveChange}
            allowEmpty
            onBeforeCloseTab={handleBeforeCloseTab}
            emptyState={
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Open a page from Story panel.
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

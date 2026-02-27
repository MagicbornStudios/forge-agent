'use client';

import * as React from 'react';
import { Bot, FileText, ShieldCheck } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/workspace';
import { WorkspaceViewport } from '@forge/shared';
import { AssistantPanel } from '../../../apps/repo-studio/src/components/features/assistant/AssistantPanel';
import { EnvScopeListPanel } from '../../../apps/repo-studio/src/components/features/env/EnvScopeListPanel';
import { EnvFileEditorPanel } from '../../../apps/repo-studio/src/components/features/env/EnvFileEditorPanel';
import { useRepoStudioShellStore } from '../../../apps/repo-studio/src/lib/app-shell/store';
import {
  createHiddenPanelSet,
  isPanelVisible,
  type RepoWorkspaceProps,
} from '../../../apps/repo-studio/src/components/workspaces/types';

function getEnvFileTabTitle(filePath: string): string {
  const n = filePath.replace(/\/+$/, '').trim();
  const i = n.lastIndexOf('/');
  return i < 0 ? n : n.slice(i + 1);
}

export function EnvExtensionWorkspaceAdapter({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
}: RepoWorkspaceProps) {
  const hiddenPanels = React.useMemo(() => createHiddenPanelSet(hiddenPanelIds), [hiddenPanelIds]);

  const viewportStateKey = React.useMemo(() => `env::${layoutId}`, [layoutId]);
  const viewportState = useRepoStudioShellStore((s) => s.viewportState[viewportStateKey]);
  const setViewportState = useRepoStudioShellStore((s) => s.setViewportState);

  const openPanelIds = React.useMemo(() => viewportState?.openIds ?? [], [viewportState?.openIds]);
  const activePanelId = React.useMemo(() => {
    if (!viewportState?.activeId) return openPanelIds[0] ?? null;
    return openPanelIds.includes(viewportState.activeId) ? viewportState.activeId : openPanelIds[0] ?? null;
  }, [openPanelIds, viewportState?.activeId]);

  const dirtyByPathRef = React.useRef<Record<string, boolean>>({});

  React.useEffect(() => {
    if (openPanelIds.length === 0 && activePanelId !== null) {
      setViewportState(viewportStateKey, { activeId: null });
    }
  }, [activePanelId, openPanelIds.length, setViewportState, viewportStateKey]);

  React.useEffect(() => {
    if (openPanelIds.length > 0 && !activePanelId) {
      setViewportState(viewportStateKey, { activeId: openPanelIds[0] });
    }
  }, [activePanelId, openPanelIds, setViewportState, viewportStateKey]);

  const onDirtyChange = React.useCallback((path: string, dirty: boolean) => {
    dirtyByPathRef.current[path] = dirty;
  }, []);

  const openEnvFile = React.useCallback(
    (filePath: string) => {
      if (!filePath) return;
      const nextOpen = openPanelIds.includes(filePath) ? openPanelIds : [...openPanelIds, filePath];
      setViewportState(viewportStateKey, {
        openIds: nextOpen,
        activeId: filePath,
      });
    },
    [openPanelIds, setViewportState, viewportStateKey],
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
    },
    [setViewportState, viewportStateKey],
  );

  const handleBeforeCloseTab = React.useCallback((panelId: string) => {
    const dirty = dirtyByPathRef.current[panelId];
    if (!dirty) return true;
    return window.confirm(`Unsaved changes in ${getEnvFileTabTitle(panelId)}. Close anyway?`);
  }, []);

  const viewportPanels = React.useMemo(
    () =>
      openPanelIds.map((filePath) => ({
        id: filePath,
        title: getEnvFileTabTitle(filePath),
        icon: <FileText size={14} />,
        content: (
          <EnvFileEditorPanel
            filePath={filePath}
            onDirtyChange={onDirtyChange}
          />
        ),
      })),
    [openPanelIds, onDirtyChange],
  );

  return (
    <WorkspaceLayout
      layoutId={layoutId}
      layoutJson={layoutJson}
      onLayoutChange={onLayoutChange}
      clearLayout={clearLayout}
      onPanelClosed={onPanelClosed}
      className="h-full"
    >
      <WorkspaceLayout.Left>
        <WorkspaceLayout.Panel id="env-tree" title="Env" icon={<ShieldCheck size={14} />}>
          <EnvScopeListPanel
            selectedFilePath={activePanelId}
            onOpenFile={openEnvFile}
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
            onBeforeCloseTab={handleBeforeCloseTab}
            emptyState={(
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Select an env file from the tree.
              </div>
            )}
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
  );
}

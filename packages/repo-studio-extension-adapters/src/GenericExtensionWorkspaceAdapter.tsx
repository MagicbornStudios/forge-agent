'use client';

import * as React from 'react';
import { Bot, LayoutGrid } from 'lucide-react';
import { WorkspaceLayout, WorkspaceToolbar } from '@forge/shared/components/workspace';
import { AssistantPanel } from '../../../apps/repo-studio/src/components/features/assistant/AssistantPanel';
import { useRepoStudioContextOptional } from '../../../apps/repo-studio/src/lib/app-shell/RepoStudioContext';
import { useRepoStudioShellStore } from '../../../apps/repo-studio/src/lib/app-shell/store';
import {
  createHiddenPanelSet,
  isPanelVisible,
  type RepoWorkspaceProps,
} from '../../../apps/repo-studio/src/components/workspaces/types';

export function GenericExtensionWorkspaceAdapter({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
}: RepoWorkspaceProps) {
  const hiddenPanels = React.useMemo(() => createHiddenPanelSet(hiddenPanelIds), [hiddenPanelIds]);
  const activeWorkspaceId = useRepoStudioShellStore((state) => state.route.activeWorkspaceId);
  const ctx = useRepoStudioContextOptional();
  const extension = ctx?.workspaceExtensionMap?.[activeWorkspaceId] || null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <WorkspaceToolbar className="shrink-0 border-b border-border px-2 py-1">
        <WorkspaceToolbar.Left>
          <span className="text-xs text-muted-foreground">{extension?.label || 'Extension'}</span>
        </WorkspaceToolbar.Left>
      </WorkspaceToolbar>

      <WorkspaceLayout
        layoutId={layoutId}
        layoutJson={layoutJson}
        onLayoutChange={onLayoutChange}
        clearLayout={clearLayout}
        onPanelClosed={onPanelClosed}
        className="min-h-0 flex-1"
      >
        <WorkspaceLayout.Main>
          <WorkspaceLayout.Panel id="workspace" title={extension?.label || 'Extension'} icon={<LayoutGrid size={14} />}>
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
              <div className="max-w-xl space-y-2 text-center">
                <p className="font-medium text-foreground">{extension?.label || 'Workspace extension'} loaded.</p>
                <p>
                  This extension uses host-rendered panels in this slice. Add extension-specific panels/tooling via manifest + host contracts.
                </p>
              </div>
            </div>
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

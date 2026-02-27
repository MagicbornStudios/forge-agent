'use client';

import * as React from 'react';
import { Bot, GitCompareArrows, TerminalSquare } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/workspace';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import { CodePanel } from '@/components/features/code/CodePanel';
import { DiffPanel } from '@/components/features/diff/DiffPanel';
import { GitPanel } from '@/components/features/git/GitPanel';
import { WorkspaceViewport } from '@forge/shared';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'code' as const;
export const WORKSPACE_LABEL = 'Code';

export function CodeWorkspace({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
  panelContext,
}: RepoWorkspaceProps) {
  const hiddenPanels = React.useMemo(() => createHiddenPanelSet(hiddenPanelIds), [hiddenPanelIds]);

  const viewportPanels = React.useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        icon: <TerminalSquare size={14} />,
        content: (
          <CodePanel
            activeLoopId={panelContext.activeLoopId}
            onCopyText={panelContext.onCopyText}
          />
        ),
      },
    ],
    [panelContext.activeLoopId, panelContext.onCopyText],
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
      <WorkspaceLayout.Main hideTabBar>
        <WorkspaceLayout.Panel id="viewport" title="Viewport" icon={<TerminalSquare size={14} />}>
          <WorkspaceViewport panels={viewportPanels} />
        </WorkspaceLayout.Panel>
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Right hideTabBar>
        {isPanelVisible(hiddenPanels, 'assistant') ? (
          <WorkspaceLayout.Panel id="assistant" title="Assistant" icon={<Bot size={14} />}>
            <AssistantPanel defaultRuntime="codex" />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Right>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'diff') ? (
          <WorkspaceLayout.Panel id="diff" title="Diff" icon={<GitCompareArrows size={14} />}>
            <DiffPanel onCopyText={panelContext.onCopyText} />
          </WorkspaceLayout.Panel>
        ) : null}
        {isPanelVisible(hiddenPanels, 'git') ? (
          <WorkspaceLayout.Panel id="git" title="Git" icon={<GitCompareArrows size={14} />}>
            <GitPanel onCopyText={panelContext.onCopyText} />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}

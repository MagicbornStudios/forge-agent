'use client';

import * as React from 'react';
import { Bot, GitCompareArrows, ShieldCheck, TerminalSquare } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/workspace';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import { CodePanel } from '@/components/features/code/CodePanel';
import { DiffPanel } from '@/components/features/diff/DiffPanel';
import { ReviewQueuePanel } from '@/components/features/review-queue/ReviewQueuePanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'review-queue' as const;
export const WORKSPACE_LABEL = 'Review Queue';

export function ReviewQueueWorkspace({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
  panelContext,
}: RepoWorkspaceProps) {
  const hiddenPanels = React.useMemo(() => createHiddenPanelSet(hiddenPanelIds), [hiddenPanelIds]);

  return (
    <WorkspaceLayout
      layoutId={layoutId}
      layoutJson={layoutJson}
      onLayoutChange={onLayoutChange}
      clearLayout={clearLayout}
      onPanelClosed={onPanelClosed}
      className="h-full"
    >
      <WorkspaceLayout.Main>
        {isPanelVisible(hiddenPanels, 'code') ? (
          <WorkspaceLayout.Panel id="code" title="Code" icon={<TerminalSquare size={14} />}>
            <CodePanel
              activeLoopId={panelContext.activeLoopId}
              onCopyText={panelContext.onCopyText}
            />
          </WorkspaceLayout.Panel>
        ) : null}
        {isPanelVisible(hiddenPanels, 'review-queue') ? (
          <WorkspaceLayout.Panel id="review-queue" title="Review Queue" icon={<ShieldCheck size={14} />}>
            <ReviewQueuePanel
              activeLoopId={panelContext.activeLoopId}
              onCopyText={panelContext.onCopyText}
            />
          </WorkspaceLayout.Panel>
        ) : null}
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
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}

'use client';

import * as React from 'react';
import { Bot, ShieldCheck, TerminalSquare } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import { CodePanel } from '@/components/features/code/CodePanel';
import { ReviewQueuePanel } from '@/components/features/review-queue/ReviewQueuePanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export function CodexAssistantWorkspace({
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
        {isPanelVisible(hiddenPanels, 'codex-assistant') ? (
          <WorkspaceLayout.Panel id="codex-assistant" title="Codex Assistant" icon={<Bot size={14} />}>
            <AssistantPanel assistantTarget="codex-assistant" />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'review-queue') ? (
          <WorkspaceLayout.Panel id="review-queue" title="Review Queue" icon={<ShieldCheck size={14} />}>
            <ReviewQueuePanel
              activeLoopId={panelContext.activeLoopId}
              onCopyText={panelContext.onCopyText}
            />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}

'use client';

import * as React from 'react';
import { BookOpen, Bot } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import { DocsPanel } from '@/components/features/docs/DocsPanel';
import { StoryPanel } from '@/components/features/story/StoryPanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

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
        {isPanelVisible(hiddenPanels, 'story') ? (
          <WorkspaceLayout.Panel id="story" title="Story" icon={<BookOpen size={14} />}>
            <StoryPanel
              activeLoopId={panelContext.activeLoopId}
              onCopyText={panelContext.onCopyText}
            />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Right>
        {isPanelVisible(hiddenPanels, 'loop-assistant') ? (
          <WorkspaceLayout.Panel id="loop-assistant" title="Loop Assistant" icon={<Bot size={14} />}>
            <AssistantPanel assistantTarget="loop-assistant" />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Right>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'docs') ? (
          <WorkspaceLayout.Panel id="docs" title="Docs" icon={<BookOpen size={14} />}>
            <DocsPanel />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}

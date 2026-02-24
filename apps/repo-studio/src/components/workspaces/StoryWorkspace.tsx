'use client';

import * as React from 'react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { renderDocsDockPanel, renderLoopAssistantDockPanel, renderStoryDockPanel } from './panels';
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
        {isPanelVisible(hiddenPanels, 'story') ? renderStoryDockPanel(panelContext) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Right>
        {isPanelVisible(hiddenPanels, 'loop-assistant') ? renderLoopAssistantDockPanel() : null}
      </WorkspaceLayout.Right>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'docs') ? renderDocsDockPanel() : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}


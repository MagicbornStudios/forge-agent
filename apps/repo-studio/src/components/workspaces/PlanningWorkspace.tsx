'use client';

import * as React from 'react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { renderLoopCadenceDockPanel, renderLoopAssistantDockPanel, renderPlanningDockPanel } from './panels';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

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
        {isPanelVisible(hiddenPanels, 'loop-cadence') ? renderLoopCadenceDockPanel(panelContext) : null}
      </WorkspaceLayout.Left>
      <WorkspaceLayout.Main>
        {isPanelVisible(hiddenPanels, 'planning') ? renderPlanningDockPanel(panelContext) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Right>
        {isPanelVisible(hiddenPanels, 'loop-assistant') ? renderLoopAssistantDockPanel() : null}
      </WorkspaceLayout.Right>
    </WorkspaceLayout>
  );
}


'use client';

import * as React from 'react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { renderCommandsDockPanel, renderLoopCadenceDockPanel, renderTerminalDockPanel } from './panels';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export function CommandsWorkspace({
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
        {isPanelVisible(hiddenPanels, 'commands') ? renderCommandsDockPanel(panelContext) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'terminal') ? renderTerminalDockPanel() : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}


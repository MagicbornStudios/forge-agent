'use client';

import * as React from 'react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { renderCodeDockPanel, renderDiffDockPanel, renderGitDockPanel } from './panels';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export function DiffWorkspace({
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
        {isPanelVisible(hiddenPanels, 'code') ? renderCodeDockPanel(panelContext) : null}
        {isPanelVisible(hiddenPanels, 'diff') ? renderDiffDockPanel(panelContext) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'git') ? renderGitDockPanel(panelContext) : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}


'use client';

import * as React from 'react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { renderCodeDockPanel, renderCodexAssistantDockPanel, renderDiffDockPanel, renderGitDockPanel } from './panels';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

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
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Right>
        {isPanelVisible(hiddenPanels, 'codex-assistant') ? renderCodexAssistantDockPanel() : null}
      </WorkspaceLayout.Right>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'diff') ? renderDiffDockPanel(panelContext) : null}
        {isPanelVisible(hiddenPanels, 'git') ? renderGitDockPanel(panelContext) : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}


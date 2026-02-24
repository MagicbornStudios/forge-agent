'use client';

import * as React from 'react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { renderDatabaseDockPanel } from './panels';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export function DatabaseWorkspace({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
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
        {isPanelVisible(hiddenPanels, 'database') ? renderDatabaseDockPanel() : null}
      </WorkspaceLayout.Main>
    </WorkspaceLayout>
  );
}

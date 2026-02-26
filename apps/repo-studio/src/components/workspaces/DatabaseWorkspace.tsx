'use client';

import * as React from 'react';
import { Database } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/workspace';
import { DatabasePanel } from '@/components/features/database/DatabasePanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'database' as const;
export const WORKSPACE_LABEL = 'Database';

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
        {isPanelVisible(hiddenPanels, 'database') ? (
          <WorkspaceLayout.Panel id="database" title="Database" icon={<Database size={14} />}>
            <DatabasePanel />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Main>
    </WorkspaceLayout>
  );
}

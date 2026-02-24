'use client';

import * as React from 'react';
import { BookOpen } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { DocsPanel } from '@/components/features/docs/DocsPanel';
import { PlanningPanel } from '@/components/features/planning/PlanningPanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export function DocsWorkspace({
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
        {isPanelVisible(hiddenPanels, 'planning') ? (
          <WorkspaceLayout.Panel id="planning" title="Planning" icon={<BookOpen size={14} />}>
            <PlanningPanel
              planning={panelContext.planningSnapshot}
              loops={panelContext.loopEntries}
              activeLoopId={panelContext.activeLoopId}
              switchingLoop={panelContext.switchingLoop}
              selectedDocId={panelContext.selectedDocId}
              onSelectDoc={panelContext.onSelectDoc}
              onSwitchLoop={panelContext.onSwitchLoop}
              onCopyMentionToken={panelContext.onCopyMentionToken}
              onCopyText={panelContext.onCopyText}
              onOpenAssistant={panelContext.onOpenAssistant}
              selectedDocContent={panelContext.selectedDocContent}
            />
          </WorkspaceLayout.Panel>
        ) : null}
        {isPanelVisible(hiddenPanels, 'docs') ? (
          <WorkspaceLayout.Panel id="docs" title="Docs" icon={<BookOpen size={14} />}>
            <DocsPanel />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Main>
    </WorkspaceLayout>
  );
}

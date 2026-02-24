'use client';

import * as React from 'react';
import { BookOpen, Bot, ShieldCheck } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import { PlanningPanel } from '@/components/features/planning/PlanningPanel';
import { LoopCadencePanel } from '@/components/features/planning/LoopCadencePanel';
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
        {isPanelVisible(hiddenPanels, 'loop-cadence') ? (
          <WorkspaceLayout.Panel id="loop-cadence" title="Loop Cadence" icon={<ShieldCheck size={14} />}>
            <LoopCadencePanel
              nextAction={panelContext.planningSnapshot.nextAction}
              onCopyText={panelContext.onCopyText}
              onRefresh={panelContext.onRefreshLoopSnapshot}
            />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Left>
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
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Right>
        {isPanelVisible(hiddenPanels, 'loop-assistant') ? (
          <WorkspaceLayout.Panel id="loop-assistant" title="Loop Assistant" icon={<Bot size={14} />}>
            <AssistantPanel assistantTarget="loop-assistant" />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Right>
    </WorkspaceLayout>
  );
}

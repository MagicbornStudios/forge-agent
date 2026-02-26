'use client';

import * as React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/workspace';
import { EnvPanel } from '@/components/features/env/EnvPanel';
import { PlanningPanel } from '@/components/features/planning/PlanningPanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'env' as const;
export const WORKSPACE_LABEL = 'Env';

export function EnvWorkspace({
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
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Right hideTabBar>
        {isPanelVisible(hiddenPanels, 'env') ? (
          <WorkspaceLayout.Panel id="env" title="Env" icon={<ShieldCheck size={14} />}>
            <EnvPanel
              profile={panelContext.profile}
              mode={panelContext.mode}
              onProfileChange={panelContext.onProfileChange}
              onModeChange={panelContext.onModeChange}
              envOutput={panelContext.envOutput}
              envDoctorPayload={panelContext.envDoctorPayload}
              dependencyHealth={panelContext.dependencyHealth}
              runtimeDeps={panelContext.runtimeDeps}
              onRunDoctor={panelContext.onRunEnvDoctor}
              onRunReconcile={panelContext.onRunEnvReconcile}
              onRefreshDeps={panelContext.onRefreshDeps}
              onCopyText={panelContext.onCopyText}
            />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Right>
    </WorkspaceLayout>
  );
}

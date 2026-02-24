'use client';

import * as React from 'react';
import { ShieldCheck, TerminalSquare, Wrench } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/editor';
import { CommandsPanel } from '@/components/features/commands/CommandsPanel';
import { TerminalPanel } from '@/components/features/commands/TerminalPanel';
import { LoopCadencePanel } from '@/components/features/planning/LoopCadencePanel';
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
        {isPanelVisible(hiddenPanels, 'commands') ? (
          <WorkspaceLayout.Panel id="commands" title="Commands" icon={<Wrench size={14} />}>
            <CommandsPanel
              commandView={panelContext.commandView}
              commandSources={panelContext.commandSources}
              filteredCommands={panelContext.filteredCommands}
              onSetView={panelContext.onSetCommandView}
              onRunCommand={panelContext.onRunCommand}
              onToggleCommand={panelContext.onToggleCommand}
              onCopyText={panelContext.onCopyText}
            />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'terminal') ? (
          <WorkspaceLayout.Panel id="terminal" title="Terminal" icon={<TerminalSquare size={14} />}>
            <TerminalPanel />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}

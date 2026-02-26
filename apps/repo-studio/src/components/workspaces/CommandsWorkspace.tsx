'use client';

import * as React from 'react';
import { TerminalSquare, Wrench } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/workspace';
import { CommandsPanel } from '@/components/features/commands/CommandsPanel';
import { TerminalPanel } from '@/components/features/commands/TerminalPanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'commands' as const;
export const WORKSPACE_LABEL = 'Commands';

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
      <WorkspaceLayout.Left hideTabBar />
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

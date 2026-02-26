'use client';

import * as React from 'react';
import { GitCompareArrows, TerminalSquare } from 'lucide-react';
import { WorkspaceLayout } from '@forge/shared/components/workspace';
import { CodePanel } from '@/components/features/code/CodePanel';
import { DiffPanel } from '@/components/features/diff/DiffPanel';
import { GitPanel } from '@/components/features/git/GitPanel';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'diff' as const;
export const WORKSPACE_LABEL = 'Diff';

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
        {isPanelVisible(hiddenPanels, 'code') ? (
          <WorkspaceLayout.Panel id="code" title="Code" icon={<TerminalSquare size={14} />}>
            <CodePanel
              activeLoopId={panelContext.activeLoopId}
              onCopyText={panelContext.onCopyText}
            />
          </WorkspaceLayout.Panel>
        ) : null}
        {isPanelVisible(hiddenPanels, 'diff') ? (
          <WorkspaceLayout.Panel id="diff" title="Diff" icon={<GitCompareArrows size={14} />}>
            <DiffPanel onCopyText={panelContext.onCopyText} />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Main>
      <WorkspaceLayout.Bottom>
        {isPanelVisible(hiddenPanels, 'git') ? (
          <WorkspaceLayout.Panel id="git" title="Git" icon={<GitCompareArrows size={14} />}>
            <GitPanel onCopyText={panelContext.onCopyText} />
          </WorkspaceLayout.Panel>
        ) : null}
      </WorkspaceLayout.Bottom>
    </WorkspaceLayout>
  );
}

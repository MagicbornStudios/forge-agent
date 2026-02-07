'use client';

import React from 'react';
import {
  EditorShell,
  ModeHeader,
  ModeToolbar,
  ModeStatusBar,
} from '@forge/shared/components/editor';
import { CodebaseAgentStrategyEditor } from '@forge/shared/components/assistant-ui';
import { useEditorStore } from '@/lib/app-shell/store';
import { MODE_EDITOR_IDS } from '@/lib/app-shell/mode-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { ModelSwitcher } from '@/components/model-switcher';
import { Badge } from '@forge/ui/badge';

export function StrategyMode() {
  const workspaceTheme = useEditorStore((s) => s.workspaceThemes.strategy);
  const editorId = MODE_EDITOR_IDS.strategy;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { workspaceId: 'strategy', editorId }),
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { workspaceId: 'strategy' }),
  ) as boolean | undefined;
  const showThreadList = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.strategy-left', { workspaceId: 'strategy', editorId }),
  ) as boolean | undefined;
  const showToolsPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.strategy-right', { workspaceId: 'strategy', editorId }),
  ) as boolean | undefined;

  return (
    <EditorShell
      modeId="strategy"
      title="Strategy"
      subtitle="Codebase agent strategy"
      domain="ai"
      theme={workspaceTheme}
      className="flex flex-col h-full min-h-0 bg-canvas"
    >
      <ModeHeader>
        <ModeHeader.Left>
          <h1 className="text-lg font-bold">Strategy</h1>
        </ModeHeader.Left>
        <ModeHeader.Center>
          <span className="text-sm text-muted-foreground">Codebase Agent Strategy Editor</span>
        </ModeHeader.Center>
      </ModeHeader>

      <ModeToolbar className="bg-sidebar border-b border-sidebar-border">
        <ModeToolbar.Left>
          <span className="text-xs text-muted-foreground">Plan, document, and refine agent behavior.</span>
        </ModeToolbar.Left>
        <ModeToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <ModelSwitcher />
          <ModeToolbar.Separator />
          <SettingsMenu workspaceId="strategy" editorId={editorId} />
        </ModeToolbar.Right>
      </ModeToolbar>

      <div className="flex-1 min-h-0">
        <CodebaseAgentStrategyEditor
          showThreadList={showThreadList !== false}
          showToolsPanel={showToolsPanel !== false}
        />
      </div>

      <ModeStatusBar>Strategy assistant ready</ModeStatusBar>
    </EditorShell>
  );
}

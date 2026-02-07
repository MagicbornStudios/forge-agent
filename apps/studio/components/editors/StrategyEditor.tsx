'use client';

import React from 'react';
import {
  EditorShell,
  EditorHeader,
  EditorToolbar,
  EditorStatusBar,
} from '@forge/shared/components/editor';
import { CodebaseAgentStrategyEditor } from '@forge/shared/components/assistant-ui';
import { EDITOR_VIEWPORT_IDS } from '@/lib/app-shell/editor-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { ModelSwitcher } from '@/components/model-switcher';
import { Badge } from '@forge/ui/badge';

export function StrategyEditor() {
  const editorId = 'strategy';
  const viewportId = EDITOR_VIEWPORT_IDS.strategy;
  const editorTheme = useSettingsStore((s) =>
    s.getSettingValue('ui.theme', { editorId }),
  ) as string | undefined;
  const editorDensity = useSettingsStore((s) =>
    s.getSettingValue('ui.density', { editorId }),
  ) as string | undefined;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { editorId, viewportId }),
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { editorId }),
  ) as boolean | undefined;
  const showThreadList = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.strategy-left', { editorId, viewportId }),
  ) as boolean | undefined;
  const showToolsPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.strategy-right', { editorId, viewportId }),
  ) as boolean | undefined;

  return (
    <EditorShell
      editorId="strategy"
      title="Strategy"
      subtitle="Codebase agent strategy"
      domain="ai"
      theme={editorTheme}
      density={editorDensity}
      className="flex flex-col h-full min-h-0 bg-canvas"
    >
      <EditorHeader>
        <EditorHeader.Left>
          <h1 className="text-lg font-bold">Strategy</h1>
        </EditorHeader.Left>
        <EditorHeader.Center>
          <span className="text-sm text-muted-foreground">Codebase Agent Strategy Editor</span>
        </EditorHeader.Center>
      </EditorHeader>

      <EditorToolbar className="bg-sidebar border-b border-sidebar-border">
        <EditorToolbar.Left>
          <span className="text-xs text-muted-foreground">Plan, document, and refine agent behavior.</span>
        </EditorToolbar.Left>
        <EditorToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <ModelSwitcher />
          <EditorToolbar.Separator />
          <SettingsMenu editorId={editorId} viewportId={viewportId} />
        </EditorToolbar.Right>
      </EditorToolbar>

      <div className="flex-1 min-h-0">
        <CodebaseAgentStrategyEditor
          showThreadList={showThreadList !== false}
          showToolsPanel={showToolsPanel !== false}
        />
      </div>

      <EditorStatusBar>Strategy assistant ready</EditorStatusBar>
    </EditorShell>
  );
}

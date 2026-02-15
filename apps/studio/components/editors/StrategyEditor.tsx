'use client';

import React, { useEffect, useMemo } from 'react';
import {
  EditorShell,
  EditorHeader,
  EditorToolbar,
  EditorStatusBar,
} from '@forge/shared/components/editor';
import { FeatureGate } from '@forge/shared';
import { CAPABILITIES } from '@forge/shared/entitlements';
import { CodebaseAgentStrategyEditor } from '@forge/shared/components/assistant-ui';
import { useEditorStore } from '@/lib/app-shell/store';
import { useEditorPanelVisibility } from '@/lib/app-shell/useEditorPanelVisibility';
import { useSettingsStore } from '@/lib/settings/store';
import {
  EditorLayoutProvider,
  EditorMenubarContribution,
  EditorMenubarMenuSlot,
} from '@/components/editor-layout';
import { ModelSwitcher } from '@/components/model-switcher';
import { Badge } from '@forge/ui/badge';
import { LayoutPanelTop, PanelLeft, PanelRight } from 'lucide-react';

export function StrategyEditor() {
  const { visibility: panelVisibility, setVisible: setPanelVisible, restoreAll: restoreAllPanels, panelSpecs } = useEditorPanelVisibility('strategy');

  const viewMenuItems = useMemo(
    () => {
      const panelIcons: Record<string, React.ReactNode> = {
        left: <PanelLeft size={16} />,
        right: <PanelRight size={16} />,
      };
      const layoutSubmenu = [
        ...panelSpecs.map((spec) => ({
          id: `panel-${spec.id}`,
          label: panelVisibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
          icon: panelIcons[spec.id] ?? <LayoutPanelTop size={16} />,
          onSelect: () => setPanelVisible(spec.key, !(panelVisibility[spec.key] !== false)),
        })),
        { id: 'view-sep-layout', type: 'separator' as const },
        {
          id: 'restore-all-panels',
          label: 'Restore all panels',
          icon: <LayoutPanelTop size={16} />,
          onSelect: restoreAllPanels,
        },
      ];
      return [
        {
          id: 'layout',
          label: 'Layout',
          icon: <LayoutPanelTop size={16} />,
          submenu: layoutSubmenu,
        },
      ];
    },
    [panelSpecs, panelVisibility, setPanelVisible, restoreAllPanels],
  );

  const editorId = 'strategy';
  const viewportId = 'strategy-main';
  const setSettingsViewportId = useEditorStore((s) => s.setSettingsViewportId);
  useEffect(() => {
    setSettingsViewportId(viewportId);
    return () => setSettingsViewportId(null);
  }, [viewportId, setSettingsViewportId]);

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
        </EditorToolbar.Right>
      </EditorToolbar>

      <EditorLayoutProvider editorId={editorId} viewportId={viewportId}>
        <EditorMenubarContribution>
          <EditorMenubarMenuSlot id="view" label="View" items={viewMenuItems} />
        </EditorMenubarContribution>

        <FeatureGate
          capability={CAPABILITIES.STUDIO_STRATEGY_EDITOR}
          mode="lock-overlay"
          className="flex-1 min-h-0"
        >
          <CodebaseAgentStrategyEditor
            showThreadList={showThreadList !== false}
            showToolsPanel={showToolsPanel !== false}
            composerTrailing={<ModelSwitcher provider="assistantUi" variant="composer" />}
          />
        </FeatureGate>
      </EditorLayoutProvider>

      <EditorStatusBar>Strategy assistant ready</EditorStatusBar>
    </EditorShell>
  );
}

'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import {
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceOverlaySurface,
  WorkspaceSettingsTrigger,
  WorkspaceShell,
  WorkspaceStatusBar,
  WorkspaceToolbar,
  SettingsTabs,
  type ActiveOverlay,
} from '@forge/shared';
import { CHARACTER_BEATS, DIALOGUE_BEATS, EDITORS } from './constants';
import { buildSettingsContribution } from './settings-contributions';
import type { DemoEditorId } from './types';

export interface MockEditorWorkspaceProps {
  editorId: DemoEditorId;
  showInspector: boolean;
  showAssistant: boolean;
  activeSettingsTab: string;
  onSettingsTabChange: (value: string) => void;
  activeOverlay: ActiveOverlay | null;
  onDismissOverlay: () => void;
}

export function MockEditorWorkspace({
  editorId,
  showInspector,
  showAssistant,
  activeSettingsTab,
  onSettingsTabChange,
  activeOverlay,
  onDismissOverlay,
}: MockEditorWorkspaceProps) {
  const editorMeta = EDITORS.find((editor) => editor.id === editorId) ?? EDITORS[0];
  const settingsTabs = React.useMemo(() => buildSettingsContribution(editorId), [editorId]);
  const beatList = editorId === 'dialogue' ? DIALOGUE_BEATS : CHARACTER_BEATS;

  return (
    <WorkspaceShell editorId={editorId} title={`${editorMeta.label} Editor`} domain={editorId} className="h-full">
      <WorkspaceShell.Toolbar>
        <WorkspaceToolbar className="border-b px-2 py-1">
          <WorkspaceToolbar.Left>
            <span className="text-xs font-semibold">{editorMeta.label} Workspace</span>
          </WorkspaceToolbar.Left>
          <WorkspaceToolbar.Right>
            <UI.Button size="sm" variant="outline">
              Validate
            </UI.Button>
            <UI.Button size="sm">Save</UI.Button>
          </WorkspaceToolbar.Right>
        </WorkspaceToolbar>
      </WorkspaceShell.Toolbar>

      <WorkspaceShell.Settings>
        <div className="pr-2">
          <WorkspaceSettingsTrigger tooltip="Open app settings" />
        </div>
      </WorkspaceShell.Settings>

      <WorkspaceShell.Layout>
        <WorkspaceLayout layoutId={`studio-workbench-${editorId}`} className="h-full">
          <WorkspaceLayout.Left>
            <WorkspacePanel panelId={`${editorId}-navigator`} title="Navigator">
              <div className="space-y-2 text-xs">
                {beatList.map((beat) => (
                  <div
                    key={beat}
                    className="rounded border border-border/70 bg-muted/30 px-2 py-1.5 text-muted-foreground"
                  >
                    {beat}
                  </div>
                ))}
              </div>
            </WorkspacePanel>
          </WorkspaceLayout.Left>

          <WorkspaceLayout.Main>
            <WorkspacePanel panelId={`${editorId}-viewport`} title="Viewport" scrollable={false}>
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/20 px-6 text-center text-sm text-muted-foreground">
                {editorId === 'dialogue'
                  ? 'Dialogue timeline and nodes render here'
                  : 'Character profile graph and notes render here'}
              </div>
            </WorkspacePanel>
          </WorkspaceLayout.Main>

          {showInspector ? (
            <WorkspaceLayout.Right>
              <WorkspacePanel panelId={`${editorId}-settings`} title="Settings Contribution" scrollable={false}>
                <div className="h-full p-3">
                  <SettingsTabs
                    tabs={settingsTabs}
                    value={activeSettingsTab}
                    onValueChange={onSettingsTabChange}
                    tabsListClassName="grid h-auto grid-cols-3"
                  />
                </div>
              </WorkspacePanel>
            </WorkspaceLayout.Right>
          ) : null}

          {showAssistant ? (
            <WorkspaceLayout.Bottom>
              <WorkspacePanel panelId={`${editorId}-assistant`} title="Assistant">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Planner:</span> Suggest tightening transitions between
                    beats.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Editor:</span> Apply style guide profile for current
                    project.
                  </p>
                </div>
              </WorkspacePanel>
            </WorkspaceLayout.Bottom>
          ) : null}
        </WorkspaceLayout>
      </WorkspaceShell.Layout>

      <WorkspaceShell.StatusBar>
        <WorkspaceStatusBar>{editorMeta.label} editor - contributions active - mock data mode</WorkspaceStatusBar>
      </WorkspaceShell.StatusBar>

      <WorkspaceShell.Overlay>
        <WorkspaceOverlaySurface
          overlays={[
            {
              id: 'studio-settings',
              type: 'modal',
              title: 'Studio Settings',
              size: 'md',
              render: ({ onDismiss }) => (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    App-level settings sheet (mock). Active editor contribution:
                    <span className="ml-1 font-medium text-foreground">{editorMeta.label}</span>
                  </p>
                  <label className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-xs">
                    Enable telemetry events
                    <UI.Switch defaultChecked />
                  </label>
                  <div className="flex justify-end">
                    <UI.Button size="sm" onClick={onDismiss}>
                      Close
                    </UI.Button>
                  </div>
                </div>
              ),
            },
          ]}
          activeOverlay={activeOverlay}
          onDismiss={onDismissOverlay}
        />
      </WorkspaceShell.Overlay>
    </WorkspaceShell>
  );
}


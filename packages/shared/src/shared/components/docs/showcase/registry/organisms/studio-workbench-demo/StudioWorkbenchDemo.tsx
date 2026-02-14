'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import {
  EditorMenubar,
  EditorProjectSelect,
  SettingsTriggerProvider,
  StudioApp,
  type ActiveOverlay,
} from '@forge/shared';
import { Bot, Settings2 } from 'lucide-react';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';
import { EDITORS, PROJECT_OPTIONS } from './constants';
import { buildMenuContribution } from './menu-contributions';
import { MockEditorWorkspace } from './MockEditorWorkspace';
import type { DemoEditorId } from './types';

export function StudioWorkbenchDemo() {
  const [activeProject, setActiveProject] = React.useState(PROJECT_OPTIONS[0]?.value ?? 'forge-platform');
  const [activeEditor, setActiveEditor] = React.useState<DemoEditorId>('dialogue');
  const [showInspector, setShowInspector] = React.useState(true);
  const [showAssistant, setShowAssistant] = React.useState(true);
  const [activeOverlay, setActiveOverlay] = React.useState<ActiveOverlay | null>(null);
  const [settingsTabByEditor, setSettingsTabByEditor] = React.useState<Record<DemoEditorId, string>>({
    dialogue: 'general',
    character: 'general',
  });

  const openSettings = React.useCallback(() => {
    setActiveOverlay({ id: 'studio-settings', payload: { source: 'menu' } });
  }, []);

  const menus = React.useMemo(
    () =>
      buildMenuContribution(activeEditor, {
        showInspector,
        showAssistant,
        toggleInspector: () => setShowInspector((value) => !value),
        toggleAssistant: () => setShowAssistant((value) => !value),
        openSettings,
      }),
    [activeEditor, openSettings, showAssistant, showInspector],
  );

  const activeSettingsTab = settingsTabByEditor[activeEditor] ?? 'general';
  const setActiveSettingsTab = React.useCallback(
    (value: string) => {
      setSettingsTabByEditor((previous) => ({ ...previous, [activeEditor]: value }));
    },
    [activeEditor],
  );

  return (
    <ShowcaseDemoSurface className="h-[700px] min-h-[560px] overflow-hidden p-0">
      <SettingsTriggerProvider openSettings={openSettings}>
        <StudioApp className="h-full min-h-0 bg-transparent">
          <StudioApp.Tabs label="Studio tabs" tabListClassName="justify-center">
            <StudioApp.Tabs.Left>
              <div className="flex min-w-0 items-center gap-[var(--control-gap)]">
                <EditorMenubar menus={menus} />
                <EditorProjectSelect
                  value={activeProject}
                  onValueChange={setActiveProject}
                  options={PROJECT_OPTIONS}
                  placeholder="Select project"
                />
              </div>
            </StudioApp.Tabs.Left>

            <StudioApp.Tabs.Main>
              {EDITORS.map((editor) => {
                const Icon = editor.icon;
                return (
                  <StudioApp.Tab
                    key={editor.id}
                    domain={editor.id}
                    isActive={activeEditor === editor.id}
                    onSelect={() => setActiveEditor(editor.id)}
                    label={
                      <span className="inline-flex items-center gap-1">
                        <Icon className="size-3 shrink-0" />
                        <span>{editor.label}</span>
                      </span>
                    }
                  />
                );
              })}
            </StudioApp.Tabs.Main>

            <StudioApp.Tabs.Right>
              <UI.Button
                size="sm"
                variant="outline"
                className="h-[var(--control-height-sm)]"
                onClick={openSettings}
              >
                <Settings2 className="size-3.5" />
              </UI.Button>
              <UI.Button size="sm" variant="outline" className="h-[var(--control-height-sm)]">
                <Bot className="size-3.5" />
              </UI.Button>
            </StudioApp.Tabs.Right>
          </StudioApp.Tabs>

          <StudioApp.Content>
            <MockEditorWorkspace
              editorId={activeEditor}
              showInspector={showInspector}
              showAssistant={showAssistant}
              activeSettingsTab={activeSettingsTab}
              onSettingsTabChange={setActiveSettingsTab}
              activeOverlay={activeOverlay}
              onDismissOverlay={() => setActiveOverlay(null)}
            />
          </StudioApp.Content>
        </StudioApp>
      </SettingsTriggerProvider>
    </ShowcaseDemoSurface>
  );
}


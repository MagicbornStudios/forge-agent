'use client';

import * as React from 'react';
import {
  createEditorMenubarMenus,
  EditorFileMenu,
  EditorHelpMenu,
  EditorMenubar,
  EditorProjectSelect,
  EditorSettingsMenu,
  StudioApp,
  type EditorMenubarMenu,
} from '@forge/shared';
import { MessageCircle, Users } from 'lucide-react';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

type DemoEditorId = 'dialogue' | 'character';

const PROJECT_OPTIONS = [
  { value: 'forge-platform', label: 'Forge Platform' },
  { value: 'studio-revamp', label: 'Studio Revamp' },
  { value: 'component-showcase', label: 'Component Showcase' },
];

const EDITORS: Array<{
  id: DemoEditorId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dialogue', label: 'Dialogue', icon: MessageCircle },
  { id: 'character', label: 'Character', icon: Users },
];

function buildContributedMenus(editorId: DemoEditorId, openSettings: () => void): EditorMenubarMenu[] {
  const editorMenus =
    editorId === 'dialogue'
      ? createEditorMenubarMenus({
          file: [
            EditorFileMenu.New({ shortcut: 'Ctrl+N' }),
            EditorFileMenu.Save({ shortcut: 'Ctrl+S' }),
          ],
          view: [
            { id: 'dialogue-view-outline', label: 'Toggle Outline' },
            { id: 'dialogue-view-notes', label: 'Toggle Notes' },
          ],
        })
      : createEditorMenubarMenus({
          file: [
            EditorFileMenu.New({ shortcut: 'Ctrl+Shift+N' }),
            EditorFileMenu.Open({ shortcut: 'Ctrl+O' }),
            EditorFileMenu.Save({ shortcut: 'Ctrl+S' }),
          ],
          view: [
            { id: 'character-view-voice', label: 'Toggle Voice Panel' },
            { id: 'character-view-relationships', label: 'Toggle Relationships' },
          ],
        });

  const sharedMenus = createEditorMenubarMenus({
    file: [],
    settings: [
      EditorSettingsMenu.OpenSettings({ onSelect: openSettings }),
      EditorSettingsMenu.Separator('settings-sep'),
      EditorSettingsMenu.User({ label: 'Account' }),
    ],
    help: [EditorHelpMenu.Welcome(), EditorHelpMenu.About()],
  });

  return [...editorMenus, ...sharedMenus];
}

export function StudioMenubarContributionDemo() {
  const [activeEditor, setActiveEditor] = React.useState<DemoEditorId>('dialogue');
  const [activeProject, setActiveProject] = React.useState(PROJECT_OPTIONS[0]?.value ?? 'forge-platform');
  const [settingsOpenCount, setSettingsOpenCount] = React.useState(0);

  const menus = React.useMemo(
    () => buildContributedMenus(activeEditor, () => setSettingsOpenCount((value) => value + 1)),
    [activeEditor],
  );

  return (
    <ShowcaseDemoSurface className="h-[300px] p-0">
      <StudioApp className="h-full min-h-0 bg-transparent">
        <StudioApp.Tabs label="Studio editor tabs">
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
                    <>
                      <Icon className="size-3 shrink-0" />
                      {editor.label}
                    </>
                  }
                />
              );
            })}
          </StudioApp.Tabs.Main>
        </StudioApp.Tabs>
        <StudioApp.Content className="min-h-0">
          <div className="flex h-full min-h-0 items-center justify-center border-t border-border/60 bg-muted/20 px-4 text-xs text-muted-foreground">
            Active editor contributes File/View menus: <span className="ml-1 font-medium text-foreground">{activeEditor}</span>
            <span className="mx-2 text-border">|</span>
            Settings opened: <span className="ml-1 font-medium text-foreground">{settingsOpenCount}</span>
          </div>
        </StudioApp.Content>
      </StudioApp>
    </ShowcaseDemoSurface>
  );
}

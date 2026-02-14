'use client';

import {
  createEditorMenubarMenus,
  EditorEditMenu,
  EditorFileMenu,
  EditorHelpMenu,
  EditorSettingsMenu,
  EditorViewMenu,
  type EditorMenubarMenu,
} from '@forge/shared';
import type { DemoEditorId } from './types';

export interface BuildMenuContributionOptions {
  showInspector: boolean;
  showAssistant: boolean;
  toggleInspector: () => void;
  toggleAssistant: () => void;
  openSettings: () => void;
}

export function buildMenuContribution(
  editorId: DemoEditorId,
  options: BuildMenuContributionOptions,
): EditorMenubarMenu[] {
  const file =
    editorId === 'dialogue'
      ? [
          EditorFileMenu.New({ shortcut: 'Ctrl+N' }),
          EditorFileMenu.Open({ shortcut: 'Ctrl+O' }),
          EditorFileMenu.Save({ shortcut: 'Ctrl+S' }),
        ]
      : [
          EditorFileMenu.New({ shortcut: 'Ctrl+Shift+N' }),
          EditorFileMenu.Separator('file-char-sep'),
          { id: 'file-import-template', label: 'Import Character Template' },
          EditorFileMenu.Save({ shortcut: 'Ctrl+S' }),
        ];

  const edit =
    editorId === 'dialogue'
      ? [
          EditorEditMenu.Undo(),
          EditorEditMenu.Redo(),
          EditorEditMenu.Separator('edit-dialogue-sep'),
          EditorEditMenu.Find(),
        ]
      : [
          EditorEditMenu.Undo(),
          EditorEditMenu.Redo(),
          EditorEditMenu.Separator('edit-character-sep'),
          EditorEditMenu.Copy(),
          EditorEditMenu.Paste(),
        ];

  const view = [
    EditorViewMenu.PanelToggle({
      id: 'inspector',
      label: 'Inspector',
      checked: options.showInspector,
      onSelect: options.toggleInspector,
    }),
    EditorViewMenu.PanelToggle({
      id: 'assistant',
      label: 'Assistant',
      checked: options.showAssistant,
      onSelect: options.toggleAssistant,
    }),
  ];

  return createEditorMenubarMenus({
    file,
    view,
    edit,
    settings: [
      EditorSettingsMenu.OpenSettings({ onSelect: options.openSettings }),
      EditorSettingsMenu.Separator('settings-sep'),
      EditorSettingsMenu.User({
        label: editorId === 'dialogue' ? 'Narrative Profile' : 'Character Profile',
      }),
    ],
    help: [EditorHelpMenu.Welcome(), EditorHelpMenu.ShowCommands(), EditorHelpMenu.About()],
  });
}

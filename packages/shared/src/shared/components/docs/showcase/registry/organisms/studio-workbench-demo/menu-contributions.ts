'use client';

import {
  createWorkspaceMenubarMenus,
  WorkspaceEditMenu,
  WorkspaceFileMenu,
  WorkspaceHelpMenu,
  WorkspaceSettingsMenu,
  WorkspaceViewMenu,
  type WorkspaceMenubarMenu,
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
): WorkspaceMenubarMenu[] {
  const file =
    editorId === 'dialogue'
      ? [
          WorkspaceFileMenu.New({ shortcut: 'Ctrl+N' }),
          WorkspaceFileMenu.Open({ shortcut: 'Ctrl+O' }),
          WorkspaceFileMenu.Save({ shortcut: 'Ctrl+S' }),
        ]
      : [
          WorkspaceFileMenu.New({ shortcut: 'Ctrl+Shift+N' }),
          WorkspaceFileMenu.Separator('file-char-sep'),
          { id: 'file-import-template', label: 'Import Character Template' },
          WorkspaceFileMenu.Save({ shortcut: 'Ctrl+S' }),
        ];

  const edit =
    editorId === 'dialogue'
      ? [
          WorkspaceEditMenu.Undo(),
          WorkspaceEditMenu.Redo(),
          WorkspaceEditMenu.Separator('edit-dialogue-sep'),
          WorkspaceEditMenu.Find(),
        ]
      : [
          WorkspaceEditMenu.Undo(),
          WorkspaceEditMenu.Redo(),
          WorkspaceEditMenu.Separator('edit-character-sep'),
          WorkspaceEditMenu.Copy(),
          WorkspaceEditMenu.Paste(),
        ];

  const view = [
    WorkspaceViewMenu.PanelToggle({
      id: 'inspector',
      label: 'Inspector',
      checked: options.showInspector,
      onSelect: options.toggleInspector,
    }),
    WorkspaceViewMenu.PanelToggle({
      id: 'assistant',
      label: 'Assistant',
      checked: options.showAssistant,
      onSelect: options.toggleAssistant,
    }),
  ];

  return createWorkspaceMenubarMenus({
    file,
    view,
    edit,
    settings: [
      WorkspaceSettingsMenu.OpenSettings({ onSelect: options.openSettings }),
      WorkspaceSettingsMenu.Separator('settings-sep'),
      WorkspaceSettingsMenu.User({
        label: editorId === 'dialogue' ? 'Narrative Profile' : 'Character Profile',
      }),
    ],
    help: [WorkspaceHelpMenu.Welcome(), WorkspaceHelpMenu.ShowCommands(), WorkspaceHelpMenu.About()],
  });
}

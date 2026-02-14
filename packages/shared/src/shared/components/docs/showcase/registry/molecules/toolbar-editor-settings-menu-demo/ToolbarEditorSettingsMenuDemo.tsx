'use client';

import {
  createEditorMenubarMenus,
  EditorFileMenu,
  EditorMenubar,
  EditorSettingsMenu,
} from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

const MENUS = createEditorMenubarMenus({
  file: [EditorFileMenu.New()],
  settings: [
    EditorSettingsMenu.OpenSettings(),
    EditorSettingsMenu.Separator(),
    EditorSettingsMenu.User({ label: 'Account' }),
  ],
});

export function ToolbarEditorSettingsMenuDemo() {
  return (
    <ShowcaseDemoSurface className="p-0">
      <EditorMenubar menus={MENUS} />
    </ShowcaseDemoSurface>
  );
}

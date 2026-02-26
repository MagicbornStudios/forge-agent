'use client';

import {
  createWorkspaceMenubarMenus,
  WorkspaceFileMenu,
  WorkspaceMenubar,
  WorkspaceSettingsMenu,
} from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

const MENUS = createWorkspaceMenubarMenus({
  file: [WorkspaceFileMenu.New()],
  settings: [
    WorkspaceSettingsMenu.OpenSettings(),
    WorkspaceSettingsMenu.Separator(),
    WorkspaceSettingsMenu.User({ label: 'Account' }),
  ],
});

export function ToolbarWorkspaceSettingsMenuDemo() {
  return (
    <ShowcaseDemoSurface className="p-0">
      <WorkspaceMenubar menus={MENUS} />
    </ShowcaseDemoSurface>
  );
}

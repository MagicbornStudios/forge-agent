'use client';

import * as UI from '@forge/ui';
import {
  WorkspaceLayout,
  WorkspacePanel,
  WorkspaceShell,
  WorkspaceStatusBar,
  WorkspaceToolbar,
} from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function WorkspaceShellDemo() {
  return (
    <ShowcaseDemoSurface className="h-[520px] p-0">
      <WorkspaceShell editorId="demo-editor" title="Demo Editor" domain="demo" className="h-full">
        <WorkspaceShell.Toolbar>
          <WorkspaceToolbar className="border-b">
            <WorkspaceToolbar.Left>
              <span className="text-xs font-medium">Demo Editor</span>
            </WorkspaceToolbar.Left>
            <WorkspaceToolbar.Right>
              <UI.Button size="sm" variant="outline">
                Save
              </UI.Button>
            </WorkspaceToolbar.Right>
          </WorkspaceToolbar>
        </WorkspaceShell.Toolbar>
        <WorkspaceShell.Layout>
          <WorkspaceLayout layoutId="demo-layout">
            <WorkspaceLayout.Left>
              <WorkspacePanel panelId="left" title="Navigator">
                <div className="p-3 text-xs text-muted-foreground">Left rail content</div>
              </WorkspacePanel>
            </WorkspaceLayout.Left>
            <WorkspaceLayout.Main>
              <WorkspacePanel panelId="main" title="Viewport" scrollable={false}>
                <div className="flex h-full min-h-[180px] items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  Main content area
                </div>
              </WorkspacePanel>
            </WorkspaceLayout.Main>
          </WorkspaceLayout>
        </WorkspaceShell.Layout>
        <WorkspaceShell.StatusBar>
          <WorkspaceStatusBar>Ready</WorkspaceStatusBar>
        </WorkspaceShell.StatusBar>
      </WorkspaceShell>
    </ShowcaseDemoSurface>
  );
}

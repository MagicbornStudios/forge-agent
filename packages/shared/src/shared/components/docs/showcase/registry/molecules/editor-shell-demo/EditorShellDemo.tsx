'use client';

import * as UI from '@forge/ui';
import {
  WorkspaceLayout,
  WorkspacePanel,
  EditorShell,
  EditorStatusBar,
  EditorToolbar,
} from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function EditorShellDemo() {
  return (
    <ShowcaseDemoSurface className="h-[520px] p-0">
      <EditorShell editorId="demo-editor" title="Demo Editor" domain="demo" className="h-full">
        <EditorShell.Toolbar>
          <EditorToolbar className="border-b">
            <EditorToolbar.Left>
              <span className="text-xs font-medium">Demo Editor</span>
            </EditorToolbar.Left>
            <EditorToolbar.Right>
              <UI.Button size="sm" variant="outline">
                Save
              </UI.Button>
            </EditorToolbar.Right>
          </EditorToolbar>
        </EditorShell.Toolbar>
        <EditorShell.Layout>
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
        </EditorShell.Layout>
        <EditorShell.StatusBar>
          <EditorStatusBar>Ready</EditorStatusBar>
        </EditorShell.StatusBar>
      </EditorShell>
    </ShowcaseDemoSurface>
  );
}

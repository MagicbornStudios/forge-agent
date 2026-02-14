'use client';

import * as UI from '@forge/ui';
import {
  EditorDockLayout,
  EditorDockPanel,
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
          <EditorDockLayout layoutId="demo-layout">
            <EditorDockLayout.Left>
              <EditorDockPanel panelId="left" title="Navigator">
                <div className="p-3 text-xs text-muted-foreground">Left rail content</div>
              </EditorDockPanel>
            </EditorDockLayout.Left>
            <EditorDockLayout.Main>
              <EditorDockPanel panelId="main" title="Viewport" scrollable={false}>
                <div className="flex h-full min-h-[180px] items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  Main content area
                </div>
              </EditorDockPanel>
            </EditorDockLayout.Main>
          </EditorDockLayout>
        </EditorShell.Layout>
        <EditorShell.StatusBar>
          <EditorStatusBar>Ready</EditorStatusBar>
        </EditorShell.StatusBar>
      </EditorShell>
    </ShowcaseDemoSurface>
  );
}

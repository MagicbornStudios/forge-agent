'use client';

import {
  EditorShell,
  EditorToolbar,
  EditorDockLayout,
  EditorDockPanel,
  EditorStatusBar,
} from '@forge/shared';
import { BookOpen, LayoutDashboard } from 'lucide-react';

export function EditorShellDemo() {
  return (
    <div className="h-[320px] overflow-hidden rounded-lg border border-border">
      <EditorShell editorId="demo" title="Demo Editor" domain="demo" className="h-full">
        <EditorToolbar className="border-b">
          <EditorToolbar.Left>
            <span className="text-xs font-medium">Demo Editor</span>
          </EditorToolbar.Left>
        </EditorToolbar>
        <EditorDockLayout layoutId="demo-layout" leftDefaultSize={25}>
          <EditorDockLayout.Left>
            <EditorDockPanel panelId="nav" title="Navigator" icon={<BookOpen size={14} />}>
              <div className="p-4 text-sm text-muted-foreground">Sidebar content</div>
            </EditorDockPanel>
          </EditorDockLayout.Left>
          <EditorDockLayout.Main>
            <EditorDockPanel panelId="main" title="Viewport" icon={<LayoutDashboard size={14} />}>
              <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
                Main content area
              </div>
            </EditorDockPanel>
          </EditorDockLayout.Main>
        </EditorDockLayout>
        <EditorStatusBar>Ready</EditorStatusBar>
      </EditorShell>
    </div>
  );
}

export default EditorShellDemo;

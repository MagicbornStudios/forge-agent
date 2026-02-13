'use client';

import {
  EditorDockLayout,
  EditorDockPanel,
} from '@forge/shared';
import { BookOpen, LayoutDashboard, Settings } from 'lucide-react';

export function DockLayoutDemo() {
  return (
    <div className="h-[280px] overflow-hidden rounded-lg border border-border">
      <EditorDockLayout layoutId="demo-dock" leftDefaultSize={20} rightDefaultSize={25}>
        <EditorDockLayout.Left>
          <EditorDockPanel panelId="nav" title="Navigator" icon={<BookOpen size={14} />}>
            <div className="p-4 text-sm text-muted-foreground">Left rail</div>
          </EditorDockPanel>
        </EditorDockLayout.Left>
        <EditorDockLayout.Main>
          <EditorDockPanel panelId="main" title="Viewport" icon={<LayoutDashboard size={14} />}>
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Main content
            </div>
          </EditorDockPanel>
        </EditorDockLayout.Main>
        <EditorDockLayout.Right>
          <EditorDockPanel panelId="inspector" title="Inspector" icon={<Settings size={14} />}>
            <div className="p-4 text-sm text-muted-foreground">Right rail</div>
          </EditorDockPanel>
        </EditorDockLayout.Right>
      </EditorDockLayout>
    </div>
  );
}

export default DockLayoutDemo;

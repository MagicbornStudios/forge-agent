'use client';

import {
  EditorDockLayout,
  EditorDockPanel,
} from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DockLayoutDemo() {
  return (
    <ShowcaseDemoSurface className="h-[420px] p-0">
      <EditorDockLayout layoutId="demo-dock-layout" className="h-full">
        <EditorDockLayout.Left>
          <EditorDockPanel panelId="nav" title="Navigator">
            <div className="p-3 text-xs text-muted-foreground">Left rail</div>
          </EditorDockPanel>
        </EditorDockLayout.Left>
        <EditorDockLayout.Main>
          <EditorDockPanel panelId="viewport" title="Viewport" scrollable={false}>
            <div className="flex h-full min-h-[160px] items-center justify-center text-xs text-muted-foreground">
              Main viewport
            </div>
          </EditorDockPanel>
        </EditorDockLayout.Main>
        <EditorDockLayout.Right>
          <EditorDockPanel panelId="inspector" title="Inspector">
            <div className="p-3 text-xs text-muted-foreground">Right rail</div>
          </EditorDockPanel>
        </EditorDockLayout.Right>
      </EditorDockLayout>
    </ShowcaseDemoSurface>
  );
}

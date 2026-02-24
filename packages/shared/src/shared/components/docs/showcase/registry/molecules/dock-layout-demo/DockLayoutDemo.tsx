'use client';

import {
  WorkspaceLayout,
  WorkspacePanel,
} from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DockLayoutDemo() {
  return (
    <ShowcaseDemoSurface className="h-[420px] p-0">
      <WorkspaceLayout layoutId="demo-dock-layout" className="h-full">
        <WorkspaceLayout.Left>
          <WorkspacePanel panelId="nav" title="Navigator">
            <div className="p-3 text-xs text-muted-foreground">Left rail</div>
          </WorkspacePanel>
        </WorkspaceLayout.Left>
        <WorkspaceLayout.Main>
          <WorkspacePanel panelId="viewport" title="Viewport" scrollable={false}>
            <div className="flex h-full min-h-[160px] items-center justify-center text-xs text-muted-foreground">
              Main viewport
            </div>
          </WorkspacePanel>
        </WorkspaceLayout.Main>
        <WorkspaceLayout.Right>
          <WorkspacePanel panelId="inspector" title="Inspector">
            <div className="p-3 text-xs text-muted-foreground">Right rail</div>
          </WorkspacePanel>
        </WorkspaceLayout.Right>
      </WorkspaceLayout>
    </ShowcaseDemoSurface>
  );
}

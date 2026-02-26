'use client';

import { WorkspaceButton, WorkspacePanel } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DockPanelDemo() {
  return (
    <ShowcaseDemoSurface className="h-[280px] p-0">
      <div className="h-full rounded-md border border-border/70 overflow-hidden">
        <WorkspacePanel
          panelId="dock-panel-demo"
          title="Dock Panel"
          headerActions={<WorkspaceButton size="sm" variant="outline">Action</WorkspaceButton>}
        >
          <WorkspacePanel.Tab id="content" label="Content">
            <div className="space-y-2 text-xs text-muted-foreground p-3">
              <p>Panel header, body, and action region.</p>
              <p>Used in docked rails and tab stacks.</p>
            </div>
          </WorkspacePanel.Tab>
          <WorkspacePanel.Tab id="about" label="About">
            <div className="p-3 text-xs text-muted-foreground">Declarative tabs via WorkspacePanel.Tab</div>
          </WorkspacePanel.Tab>
        </WorkspacePanel>
      </div>
    </ShowcaseDemoSurface>
  );
}

'use client';

import { EditorButton, EditorDockPanel } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DockPanelDemo() {
  return (
    <ShowcaseDemoSurface className="h-[280px] p-0">
      <div className="h-full rounded-md border border-border/70 overflow-hidden">
        <EditorDockPanel
          panelId="dock-panel-demo"
          title="Dock Panel"
          headerActions={<EditorButton size="sm" variant="outline">Action</EditorButton>}
        >
          <EditorDockPanel.Tab id="content" label="Content">
            <div className="space-y-2 text-xs text-muted-foreground p-3">
              <p>Panel header, body, and action region.</p>
              <p>Used in docked rails and tab stacks.</p>
            </div>
          </EditorDockPanel.Tab>
          <EditorDockPanel.Tab id="about" label="About">
            <div className="p-3 text-xs text-muted-foreground">Declarative tabs via EditorDockPanel.Tab</div>
          </EditorDockPanel.Tab>
        </EditorDockPanel>
      </div>
    </ShowcaseDemoSurface>
  );
}

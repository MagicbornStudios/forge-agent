'use client';

import * as UI from '@forge/ui';
import { WorkspaceToolbar } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function WorkspaceToolbarDemo() {
  return (
    <ShowcaseDemoSurface className="p-0">
      <WorkspaceToolbar className="border-b px-2 py-1">
        <WorkspaceToolbar.Left>
          <span className="text-xs font-medium">Editor title</span>
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Right>
          <UI.Button size="sm" variant="outline">
            Undo
          </UI.Button>
          <UI.Button size="sm" variant="outline">
            Redo
          </UI.Button>
          <UI.Button size="sm">Save</UI.Button>
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>
      <div className="p-4 text-sm text-muted-foreground">Toolbar content area</div>
    </ShowcaseDemoSurface>
  );
}

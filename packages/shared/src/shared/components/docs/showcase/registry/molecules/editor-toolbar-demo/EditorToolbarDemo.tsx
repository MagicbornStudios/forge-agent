'use client';

import * as UI from '@forge/ui';
import { EditorToolbar } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function EditorToolbarDemo() {
  return (
    <ShowcaseDemoSurface className="p-0">
      <EditorToolbar className="border-b px-2 py-1">
        <EditorToolbar.Left>
          <span className="text-xs font-medium">Editor title</span>
        </EditorToolbar.Left>
        <EditorToolbar.Right>
          <UI.Button size="sm" variant="outline">
            Undo
          </UI.Button>
          <UI.Button size="sm" variant="outline">
            Redo
          </UI.Button>
          <UI.Button size="sm">Save</UI.Button>
        </EditorToolbar.Right>
      </EditorToolbar>
      <div className="p-4 text-sm text-muted-foreground">Toolbar content area</div>
    </ShowcaseDemoSurface>
  );
}

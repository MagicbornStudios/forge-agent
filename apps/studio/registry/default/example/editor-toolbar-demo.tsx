'use client';

import { EditorToolbar, EditorToolbarButton } from '@forge/shared';
import { Save, Undo2, Redo2 } from 'lucide-react';

export function EditorToolbarDemo() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <EditorToolbar className="border-b">
        <EditorToolbar.Left>
          <span className="text-xs font-medium">Editor title</span>
        </EditorToolbar.Left>
        <EditorToolbar.Right>
          <EditorToolbar.Button>
            <Undo2 size={14} />
          </EditorToolbar.Button>
          <EditorToolbar.Button>
            <Redo2 size={14} />
          </EditorToolbar.Button>
          <EditorToolbar.Button>
            <Save size={14} />
          </EditorToolbar.Button>
        </EditorToolbar.Right>
      </EditorToolbar>
      <div className="p-4 text-sm text-muted-foreground">Toolbar content area</div>
    </div>
  );
}

export default EditorToolbarDemo;

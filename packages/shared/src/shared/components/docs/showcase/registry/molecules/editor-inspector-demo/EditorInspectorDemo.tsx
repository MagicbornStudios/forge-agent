'use client';

import { EditorInspector } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function EditorInspectorDemo() {
  return (
    <ShowcaseDemoSurface>
      <EditorInspector>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Inspector section one</p>
          <p>Inspector section two</p>
        </div>
      </EditorInspector>
    </ShowcaseDemoSurface>
  );
}

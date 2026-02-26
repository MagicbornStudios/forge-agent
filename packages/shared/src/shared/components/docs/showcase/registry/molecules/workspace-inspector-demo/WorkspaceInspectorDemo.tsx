'use client';

import { WorkspaceInspector } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function WorkspaceInspectorDemo() {
  return (
    <ShowcaseDemoSurface>
      <WorkspaceInspector>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Inspector section one</p>
          <p>Inspector section two</p>
        </div>
      </WorkspaceInspector>
    </ShowcaseDemoSurface>
  );
}

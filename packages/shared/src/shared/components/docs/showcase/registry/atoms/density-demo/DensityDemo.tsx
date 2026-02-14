'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DensityDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="grid gap-4 md:grid-cols-2">
        <div data-density="compact" className="space-y-2 rounded-md border bg-background p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Compact</p>
          <UI.Button size="sm">Save</UI.Button>
          <UI.Input placeholder="Compact input" />
        </div>
        <div data-density="comfortable" className="space-y-2 rounded-md border bg-background p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Comfortable</p>
          <UI.Button>Save</UI.Button>
          <UI.Input placeholder="Comfortable input" />
        </div>
      </div>
    </ShowcaseDemoSurface>
  );
}

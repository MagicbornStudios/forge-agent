'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function ButtonDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="flex flex-wrap gap-2">
        <UI.Button>Default</UI.Button>
        <UI.Button variant="secondary">Secondary</UI.Button>
        <UI.Button variant="outline">Outline</UI.Button>
        <UI.Button variant="ghost">Ghost</UI.Button>
      </div>
    </ShowcaseDemoSurface>
  );
}

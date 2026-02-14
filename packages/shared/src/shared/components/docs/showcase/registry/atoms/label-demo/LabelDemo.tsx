'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function LabelDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="grid max-w-sm gap-2">
        <UI.Label htmlFor="docs-label-demo">Email</UI.Label>
        <UI.Input id="docs-label-demo" type="email" placeholder="name@example.com" />
      </div>
    </ShowcaseDemoSurface>
  );
}

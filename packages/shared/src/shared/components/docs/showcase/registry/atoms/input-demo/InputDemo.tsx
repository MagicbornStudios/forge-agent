'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function InputDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="flex max-w-sm flex-col gap-3">
        <UI.Input placeholder="Enter text..." />
        <UI.Input type="email" placeholder="name@example.com" />
      </div>
    </ShowcaseDemoSurface>
  );
}

'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function BadgeDemo() {
  return (
    <ShowcaseDemoSurface>
      <div className="flex flex-wrap gap-2">
        <UI.Badge>Default</UI.Badge>
        <UI.Badge variant="secondary">Secondary</UI.Badge>
        <UI.Badge variant="outline">Outline</UI.Badge>
        <UI.Badge variant="destructive">Destructive</UI.Badge>
      </div>
    </ShowcaseDemoSurface>
  );
}

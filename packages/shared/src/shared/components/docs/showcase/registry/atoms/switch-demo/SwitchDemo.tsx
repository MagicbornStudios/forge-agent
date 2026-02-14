'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function SwitchDemo() {
  const [checked, setChecked] = React.useState(false);
  return (
    <ShowcaseDemoSurface>
      <div className="flex items-center gap-2">
        <UI.Switch id="docs-switch-demo" checked={checked} onCheckedChange={setChecked} />
        <UI.Label htmlFor="docs-switch-demo">{checked ? 'On' : 'Off'}</UI.Label>
      </div>
    </ShowcaseDemoSurface>
  );
}

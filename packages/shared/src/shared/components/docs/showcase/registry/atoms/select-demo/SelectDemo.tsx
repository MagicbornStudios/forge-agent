'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function SelectDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Select defaultValue="apple">
        <UI.SelectTrigger className="w-[180px]">
          <UI.SelectValue placeholder="Choose fruit" />
        </UI.SelectTrigger>
        <UI.SelectContent>
          <UI.SelectItem value="apple">Apple</UI.SelectItem>
          <UI.SelectItem value="banana">Banana</UI.SelectItem>
          <UI.SelectItem value="cherry">Cherry</UI.SelectItem>
        </UI.SelectContent>
      </UI.Select>
    </ShowcaseDemoSurface>
  );
}

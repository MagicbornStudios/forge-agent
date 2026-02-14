'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DialogDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Dialog>
        <UI.DialogTrigger asChild>
          <UI.Button variant="outline">Open dialog</UI.Button>
        </UI.DialogTrigger>
        <UI.DialogContent>
          <UI.DialogHeader>
            <UI.DialogTitle>Dialog title</UI.DialogTitle>
            <UI.DialogDescription>A short description for dialog content.</UI.DialogDescription>
          </UI.DialogHeader>
        </UI.DialogContent>
      </UI.Dialog>
    </ShowcaseDemoSurface>
  );
}

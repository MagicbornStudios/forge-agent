'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DropdownMenuDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.DropdownMenu>
        <UI.DropdownMenuTrigger asChild>
          <UI.Button variant="outline">Open menu</UI.Button>
        </UI.DropdownMenuTrigger>
        <UI.DropdownMenuContent>
          <UI.DropdownMenuItem>New file</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Open</UI.DropdownMenuItem>
          <UI.DropdownMenuItem>Save</UI.DropdownMenuItem>
        </UI.DropdownMenuContent>
      </UI.DropdownMenu>
    </ShowcaseDemoSurface>
  );
}

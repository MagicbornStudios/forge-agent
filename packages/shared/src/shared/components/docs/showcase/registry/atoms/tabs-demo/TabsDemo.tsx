'use client';

import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function TabsDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Tabs defaultValue="tab1" className="w-full">
        <UI.TabsList>
          <UI.TabsTrigger value="tab1">Tab 1</UI.TabsTrigger>
          <UI.TabsTrigger value="tab2">Tab 2</UI.TabsTrigger>
          <UI.TabsTrigger value="tab3">Tab 3</UI.TabsTrigger>
        </UI.TabsList>
        <UI.TabsContent value="tab1" className="rounded border border-border p-4">
          Content for tab 1
        </UI.TabsContent>
        <UI.TabsContent value="tab2" className="rounded border border-border p-4">
          Content for tab 2
        </UI.TabsContent>
        <UI.TabsContent value="tab3" className="rounded border border-border p-4">
          Content for tab 3
        </UI.TabsContent>
      </UI.Tabs>
    </ShowcaseDemoSurface>
  );
}

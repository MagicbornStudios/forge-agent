'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@forge/ui/tabs';

export function TabsDemo() {
  return (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="rounded border border-border p-4">
        Content for tab 1
      </TabsContent>
      <TabsContent value="tab2" className="rounded border border-border p-4">
        Content for tab 2
      </TabsContent>
      <TabsContent value="tab3" className="rounded border border-border p-4">
        Content for tab 3
      </TabsContent>
    </Tabs>
  );
}

export default TabsDemo;

'use client';

import React, { useState } from 'react';
import { EditorBottomPanel } from '@forge/shared';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@forge/ui/tabs';

const TABS = [
  { id: 'settings', label: 'Settings' },
  { id: 'debug', label: 'Debug' },
  { id: 'logs', label: 'Logs' },
] as const;

export function ForgeWorkspaceDrawer() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);

  return (
    <EditorBottomPanel>
      <div className="flex flex-col h-full min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-9">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="settings" className="flex-1 mt-2 min-h-0 p-[var(--panel-padding)] text-sm text-muted-foreground">
            Workspace and editor settings for Forge. Use the Settings menu in the toolbar for full options.
          </TabsContent>
          <TabsContent value="debug" className="flex-1 mt-2 min-h-0 p-[var(--panel-padding)] text-sm text-muted-foreground">
            Debug info and selection summary (placeholder).
          </TabsContent>
          <TabsContent value="logs" className="flex-1 mt-2 min-h-0 p-[var(--panel-padding)] text-sm text-muted-foreground">
            Logs and console output (placeholder).
          </TabsContent>
        </Tabs>
      </div>
    </EditorBottomPanel>
  );
}

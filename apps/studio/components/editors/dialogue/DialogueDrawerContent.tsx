'use client';

import React, { useState } from 'react';
import { EditorBottomPanel } from '@forge/shared';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@forge/ui/tabs';
import { CopilotKitDevToolsPanel } from './CopilotKitDevToolsPanel';

const TABS = [
  { id: 'workflow', label: 'Workflow' },
  { id: 'copilotkit', label: 'CopilotKit' },
] as const;

export interface DialogueDrawerContentProps {
  workflowPanel?: React.ReactNode;
}

export function DialogueDrawerContent({ workflowPanel }: DialogueDrawerContentProps) {
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
          <TabsContent value="workflow" className="flex-1 mt-2 min-h-0 p-[var(--panel-padding)]">
            {workflowPanel ?? (
              <div className="text-xs text-muted-foreground">
                Workflow panel is not available in this editor.
              </div>
            )}
          </TabsContent>
          <TabsContent value="copilotkit" className="flex-1 mt-2 min-h-0 p-[var(--panel-padding)]">
            <CopilotKitDevToolsPanel className="h-full" />
          </TabsContent>
        </Tabs>
      </div>
    </EditorBottomPanel>
  );
}

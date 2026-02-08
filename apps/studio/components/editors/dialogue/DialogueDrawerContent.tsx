'use client';

import React, { useState } from 'react';
import { EditorBottomPanel } from '@forge/shared';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@forge/ui/tabs';
import { DialogueAssistantPanel } from './DialogueAssistantPanel';
import { CopilotKitDevToolsPanel } from './CopilotKitDevToolsPanel';
import { AssistantDevToolsPanel } from './AssistantDevToolsPanel';

const TABS = [
  { id: 'assistant', label: 'Assistant' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'copilotkit', label: 'CopilotKit' },
  { id: 'assistant-devtools', label: 'Assistant UI' },
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
          <TabsContent value="assistant" className="flex-1 mt-2 min-h-0 p-0">
            <DialogueAssistantPanel className="h-full" />
          </TabsContent>
          <TabsContent value="workflow" className="flex-1 mt-2 min-h-0 p-2">
            {workflowPanel ?? (
              <div className="text-xs text-muted-foreground">
                Workflow panel is not available in this editor.
              </div>
            )}
          </TabsContent>
          <TabsContent value="copilotkit" className="flex-1 mt-2 min-h-0 p-2">
            <CopilotKitDevToolsPanel className="h-full" />
          </TabsContent>
          <TabsContent value="assistant-devtools" className="flex-1 mt-2 min-h-0 p-2">
            <AssistantDevToolsPanel className="h-full" />
          </TabsContent>
        </Tabs>
      </div>
    </EditorBottomPanel>
  );
}

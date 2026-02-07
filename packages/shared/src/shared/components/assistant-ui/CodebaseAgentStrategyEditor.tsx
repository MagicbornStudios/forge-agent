'use client';

import * as React from 'react';
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  AuiIf,
  useAuiState,
} from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { DockLayout, DockPanel } from '../editor';
import { Thread } from './thread';
import { ThreadList } from './thread-list';
import { ToolFallback } from './tool-fallback';
import { ToolUIRegistry } from '../tool-ui/assistant-tools';
import { cn } from '@forge/shared/lib/utils';

export interface CodebaseAgentStrategyEditorProps {
  apiUrl?: string;
  showThreadList?: boolean;
  showToolsPanel?: boolean;
  className?: string;
}

const ToolOnlyAssistantMessage: React.FC = () => {
  const hasToolCalls = useAuiState(({ message }) =>
    message.parts.some((part) => part.type === 'tool-call'),
  );

  if (!hasToolCalls) return null;

  return (
    <MessagePrimitive.Root className="mb-3">
      <MessagePrimitive.Parts
        components={{
          Text: () => null,
          tools: { Fallback: ToolFallback },
        }}
      />
    </MessagePrimitive.Root>
  );
};

const ToolActivityFeed: React.FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-3 py-3">
        <AuiIf condition={({ thread }) => thread.isEmpty}>
          <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            Tool activity will appear here when the assistant calls tools.
          </div>
        </AuiIf>
        <ThreadPrimitive.Messages
          components={{
            UserMessage: () => null,
            AssistantMessage: ToolOnlyAssistantMessage,
            SystemMessage: () => null,
          }}
        />
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

export function CodebaseAgentStrategyEditor({
  apiUrl = '/api/assistant-chat',
  showThreadList = true,
  showToolsPanel = true,
  className,
}: CodebaseAgentStrategyEditorProps) {
  const transport = React.useMemo(
    () => new AssistantChatTransport({ api: apiUrl }),
    [apiUrl],
  );
  const runtime = useChatRuntime({ transport });

  const leftPanel =
    showThreadList === false ? undefined : (
      <DockPanel panelId="strategy-threads" title="Threads" scrollable={false} className="h-full">
        <div className="h-full p-3">
          <ThreadList />
        </div>
      </DockPanel>
    );

  const rightPanel =
    showToolsPanel === false ? undefined : (
      <DockPanel panelId="strategy-tools" title="Tool Activity" scrollable={false} className="h-full">
        <ToolActivityFeed />
      </DockPanel>
    );

  const mainPanel = (
    <DockPanel panelId="strategy-thread" scrollable={false} className="h-full">
      <Thread />
    </DockPanel>
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ToolUIRegistry />
      <div className={cn('flex h-full min-h-0 flex-1 flex-col', className)}>
        <DockLayout
          left={leftPanel}
          main={mainPanel}
          right={rightPanel}
          layoutId="strategy-editor"
          viewport={{ viewportId: 'strategy-chat', viewportType: 'assistant-ui' }}
        />
      </div>
    </AssistantRuntimeProvider>
  );
}

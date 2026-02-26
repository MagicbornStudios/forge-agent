'use client';

import * as React from 'react';
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  AuiIf,
  WebSpeechDictationAdapter,
  useAuiState,
} from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { AppProviders } from '../app';
import { WorkspaceLayout, WorkspacePanel } from '../workspace';
import { Thread } from './thread';
import { ThreadList } from './thread-list';
import { ToolFallback } from './tool-fallback';
import { AssistantDevToolsBridge } from './devtools-bridge';
import { ToolUIRegistry } from '../tool-ui/assistant-tools';
import { cn } from '@forge/shared/lib/utils';

export interface CodebaseAgentStrategyWorkspaceProps {
  apiUrl?: string;
  showThreadList?: boolean;
  showToolsPanel?: boolean;
  composerLeading?: React.ReactNode;
  composerTrailing?: React.ReactNode;
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
  const messageCount = useAuiState(({ thread }) => thread?.messages?.length ?? 0);

  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-3 py-3">
        <AuiIf condition={({ thread }) => Boolean(thread?.isEmpty)}>
          <div className="rounded-md border border-dashed border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            Tool activity will appear here when the assistant calls tools.
          </div>
        </AuiIf>
        {messageCount > 0
          ? Array.from({ length: messageCount }, (_, index) => (
              <ThreadPrimitive.MessageByIndex
                key={index}
                index={index}
                components={{
                  UserMessage: () => null,
                  AssistantMessage: ToolOnlyAssistantMessage,
                  SystemMessage: () => null,
                }}
              />
            ))
          : null}
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

export function CodebaseAgentStrategyWorkspace(props: CodebaseAgentStrategyWorkspaceProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('flex h-full min-h-0 flex-1 items-center justify-center text-xs text-muted-foreground', props.className)}>
        Loading strategy editor…
      </div>
    );
  }

  return <CodebaseAgentStrategyWorkspaceClient {...props} />;
}

function CodebaseAgentStrategyWorkspaceClient({
  apiUrl = '/api/assistant-chat',
  showThreadList = true,
  showToolsPanel = true,
  composerLeading,
  composerTrailing,
  className,
}: CodebaseAgentStrategyWorkspaceProps) {
  const transport = React.useMemo(
    () => new AssistantChatTransport({ api: apiUrl }),
    [apiUrl],
  );
  const dictationAdapter = React.useMemo(() => {
    if (!WebSpeechDictationAdapter.isSupported()) return undefined;
    return new WebSpeechDictationAdapter();
  }, []);
  const runtime = useChatRuntime({
    transport,
    ...(dictationAdapter ? { adapters: { dictation: dictationAdapter } } : {}),
  });

  const leftPanel =
    showThreadList === false ? undefined : (
      <WorkspaceLayout.Panel id="strategy-threads" title="Threads">
        <WorkspacePanel panelId="strategy-threads-content" title="Threads" hideTitleBar scrollable={false} className="h-full">
          <div className="h-full p-3">
            <ThreadList />
          </div>
        </WorkspacePanel>
      </WorkspaceLayout.Panel>
    );

  const rightPanel =
    showToolsPanel === false ? undefined : (
      <WorkspaceLayout.Panel id="strategy-tools" title="Tool Activity">
        <WorkspacePanel panelId="strategy-tools-content" title="Tool Activity" hideTitleBar scrollable={false} className="h-full">
          <ToolActivityFeed />
        </WorkspacePanel>
      </WorkspaceLayout.Panel>
    );

  const mainPanel = (
    <WorkspaceLayout.Panel id="strategy-thread" title="Thread">
      <WorkspacePanel panelId="strategy-thread-content" hideTitleBar scrollable={false} className="h-full">
        <Thread composerLeading={composerLeading} composerTrailing={composerTrailing} />
      </WorkspacePanel>
    </WorkspaceLayout.Panel>
  );

  return (
    <AppProviders>
      <AssistantRuntimeProvider runtime={runtime}>
        <AssistantDevToolsBridge />
        <ToolUIRegistry />
        <div className={cn('flex h-full min-h-0 flex-1 flex-col', className)}>
          <WorkspaceLayout
            layoutId="strategy-editor"
            viewport={{ viewportId: 'strategy-chat', viewportType: 'assistant-ui' }}
          >
            <WorkspaceLayout.Main>
              {mainPanel}
            </WorkspaceLayout.Main>
            {leftPanel ? (
              <WorkspaceLayout.Left>
                {leftPanel}
              </WorkspaceLayout.Left>
            ) : null}
            {rightPanel ? (
              <WorkspaceLayout.Right>
                {rightPanel}
              </WorkspaceLayout.Right>
            ) : null}
          </WorkspaceLayout>
        </div>
      </AssistantRuntimeProvider>
    </AppProviders>
  );
}

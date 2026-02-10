'use client';

import * as React from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { Thread } from '@forge/shared/components/assistant-ui/thread';
import { AssistantDevToolsBridge } from '@forge/shared/components/assistant-ui';
import { ToolUIRegistry } from '@forge/shared/components/tool-ui/assistant-tools';
import { cn } from '@/lib/utils';

export interface DialogueAssistantPanelProps {
  apiUrl?: string;
  composerLeading?: React.ReactNode;
  composerTrailing?: React.ReactNode;
  className?: string;
}

export function DialogueAssistantPanel({
  apiUrl = '/api/assistant-chat',
  composerLeading,
  composerTrailing,
  className,
}: DialogueAssistantPanelProps) {
  const transport = React.useMemo(() => new AssistantChatTransport({ api: apiUrl }), [apiUrl]);
  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantDevToolsBridge />
      <ToolUIRegistry />
      <div className={cn('flex h-full min-h-0 flex-col', className)}>
        <Thread composerLeading={composerLeading} composerTrailing={composerTrailing} />
      </div>
    </AssistantRuntimeProvider>
  );
}

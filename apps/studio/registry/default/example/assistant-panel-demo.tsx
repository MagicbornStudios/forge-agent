'use client';

import * as React from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { Thread } from '@forge/shared/components/assistant-ui/thread';

/** Mock assistant chat panel. Uses placeholder API; messages will not persist. */
function AssistantPanelInner() {
  const transport = React.useMemo(
    () => new AssistantChatTransport({ api: '/api/assistant-chat' }),
    []
  );
  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-[280px] flex-col overflow-hidden rounded-lg border border-border bg-muted/30">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}

export function AssistantPanelDemo() {
  return <AssistantPanelInner />;
}

export default AssistantPanelDemo;

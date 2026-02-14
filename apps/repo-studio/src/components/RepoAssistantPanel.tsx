'use client';

import * as React from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { Thread } from '@forge/shared/components/assistant-ui/thread';
import { AssistantDevToolsBridge } from '@forge/shared/components/assistant-ui';
import { ToolUIRegistry } from '@forge/shared/components/tool-ui/assistant-tools';
import {
  DomainToolsRenderer,
  useDomainAssistant,
  type DomainAssistantContract,
} from '@forge/shared/assistant';

export interface RepoAssistantPanelProps {
  apiUrl?: string;
  transportHeaders?: Record<string, string>;
  composerLeading?: React.ReactNode;
  composerTrailing?: React.ReactNode;
  className?: string;
  contract?: DomainAssistantContract;
  toolsEnabled?: boolean;
}

export function RepoAssistantPanel({
  apiUrl = '/api/assistant-chat',
  transportHeaders,
  composerLeading,
  composerTrailing,
  className,
  contract,
  toolsEnabled = false,
}: RepoAssistantPanelProps) {
  const transport = React.useMemo(
    () => new AssistantChatTransport({
      api: apiUrl,
      ...(transportHeaders ? { headers: transportHeaders } : {}),
    }),
    [apiUrl, transportHeaders],
  );
  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantDevToolsBridge />
      <ToolUIRegistry />
      {contract ? (
        <RepoAssistantDomainTools contract={contract} toolsEnabled={toolsEnabled} />
      ) : null}
      <div className={`flex h-full min-h-0 flex-col ${className || ''}`}>
        <Thread composerLeading={composerLeading} composerTrailing={composerTrailing} />
      </div>
    </AssistantRuntimeProvider>
  );
}

function RepoAssistantDomainTools({
  contract,
  toolsEnabled,
}: {
  contract: DomainAssistantContract;
  toolsEnabled: boolean;
}) {
  useDomainAssistant(contract, { enabled: toolsEnabled });
  return <DomainToolsRenderer contract={contract} enabled={toolsEnabled} />;
}

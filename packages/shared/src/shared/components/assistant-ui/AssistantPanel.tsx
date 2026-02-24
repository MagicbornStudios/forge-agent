'use client';

import * as React from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { cn } from '@forge/shared/lib/utils';
import { DomainToolsRenderer, useDomainAssistant, type DomainAssistantContract } from '../../assistant';
import { ToolUIRegistry } from '../tool-ui/assistant-tools';
import { AssistantDevToolsBridge } from './devtools-bridge';
import { Thread } from './thread';

export interface AssistantPanelProps {
  apiUrl?: string;
  transportHeaders?: Record<string, string>;
  transportCredentials?: RequestCredentials;
  composerLeading?: React.ReactNode;
  composerTrailing?: React.ReactNode;
  className?: string;
  contract?: DomainAssistantContract;
  toolsEnabled?: boolean;
  extraToolUi?: React.ReactNode;
}

export function AssistantPanel({
  apiUrl = '/api/assistant-chat',
  transportHeaders,
  transportCredentials = 'include',
  composerLeading,
  composerTrailing,
  className,
  contract,
  toolsEnabled = false,
  extraToolUi,
}: AssistantPanelProps) {
  const transport = React.useMemo(
    () =>
      new AssistantChatTransport({
        api: apiUrl,
        credentials: transportCredentials,
        ...(transportHeaders ? { headers: transportHeaders } : {}),
      }),
    [apiUrl, transportCredentials, transportHeaders],
  );

  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantDevToolsBridge />
      <ToolUIRegistry />
      {contract ? (
        <AssistantPanelDomainTools contract={contract} toolsEnabled={toolsEnabled} />
      ) : null}
      {extraToolUi}
      <div className={cn('flex h-full min-h-0 flex-col', className)}>
        <Thread composerLeading={composerLeading} composerTrailing={composerTrailing} />
      </div>
    </AssistantRuntimeProvider>
  );
}

function AssistantPanelDomainTools({
  contract,
  toolsEnabled,
}: {
  contract: DomainAssistantContract;
  toolsEnabled: boolean;
}) {
  useDomainAssistant(contract, { enabled: toolsEnabled });
  return <DomainToolsRenderer contract={contract} enabled={toolsEnabled} />;
}


'use client';

import * as React from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { Thread } from '@forge/shared/components/assistant-ui/thread';
import { AssistantDevToolsBridge } from '@forge/shared/components/assistant-ui';
import { ToolUIRegistry } from '@forge/shared/components/tool-ui/assistant-tools';
import { useDomainAssistant, DomainToolsRenderer, type DomainAssistantContract } from '@forge/shared/assistant';
import { ForgePlanExecuteProvider, ForgePlanToolUI } from '@forge/domain-forge/assistant';
import { cn } from '@/lib/utils';
import { API_ROUTES } from '@/lib/api-client/routes';

export interface DialogueAssistantPanelProps {
  apiUrl?: string;
  transportHeaders?: Record<string, string>;
  composerLeading?: React.ReactNode;
  composerTrailing?: React.ReactNode;
  className?: string;
  /** Optional domain contract for Assistant UI tools. When provided and toolsEnabled, registers domain tools. */
  contract?: DomainAssistantContract;
  toolsEnabled?: boolean;
  /** Optional executePlan for forge_createPlan Apply button. Required for Plan UI to apply steps. */
  executePlan?: (steps: unknown[]) => void;
}

export function DialogueAssistantPanel({
  apiUrl = API_ROUTES.ASSISTANT_CHAT,
  transportHeaders,
  composerLeading,
  composerTrailing,
  className,
  contract,
  toolsEnabled = false,
  executePlan,
}: DialogueAssistantPanelProps) {
  const transport = React.useMemo(
    () =>
      new AssistantChatTransport({
        api: apiUrl,
        credentials: 'include',
        ...(transportHeaders ? { headers: transportHeaders } : {}),
      }),
    [apiUrl, transportHeaders]
  );
  const runtime = useChatRuntime({ transport });

  const content = (
    <>
      <AssistantDevToolsBridge />
      <ToolUIRegistry />
      {contract && (
        <DialogueAssistantPanelDomainTools contract={contract} toolsEnabled={toolsEnabled} />
      )}
      {executePlan && (
        <ForgePlanExecuteProvider executePlan={executePlan}>
          <ForgePlanToolUI />
        </ForgePlanExecuteProvider>
      )}
      <div className={cn('flex h-full min-h-0 flex-col', className)}>
        <Thread composerLeading={composerLeading} composerTrailing={composerTrailing} />
      </div>
    </>
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {content}
    </AssistantRuntimeProvider>
  );
}

/** Inner component so hooks run inside AssistantRuntimeProvider. */
function DialogueAssistantPanelDomainTools({
  contract,
  toolsEnabled,
}: {
  contract: DomainAssistantContract;
  toolsEnabled: boolean;
}) {
  useDomainAssistant(contract, { enabled: toolsEnabled });
  return <DomainToolsRenderer contract={contract} enabled={toolsEnabled} />;
}

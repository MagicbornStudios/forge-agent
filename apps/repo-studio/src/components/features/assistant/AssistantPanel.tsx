'use client';

import * as React from 'react';
import { AssistantPanel as SharedAssistantPanel } from '@forge/shared/components/assistant-ui';

export interface AssistantPanelProps {
  assistantTarget: 'loop-assistant' | 'codex-assistant';
}

export function AssistantPanel({
  assistantTarget,
}: AssistantPanelProps) {
  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('assistantTarget', assistantTarget);
    return `/api/assistant-chat?${params.toString()}`;
  }, [assistantTarget]);

  return (
    <div className="h-full min-h-0 flex flex-col overflow-auto">
      <SharedAssistantPanel apiUrl={apiUrl} className="h-full min-h-0 flex-1" />
    </div>
  );
}


'use client';

import * as React from 'react';
import { RepoAssistantPanel } from '@/components/RepoAssistantPanel';

export interface AssistantPanelProps {
  title: string;
  editorTarget: 'loop-assistant' | 'codex-assistant';
}

export function AssistantPanel({
  title,
  editorTarget,
}: AssistantPanelProps) {
  void title;
  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('editorTarget', editorTarget);
    return `/api/assistant-chat?${params.toString()}`;
  }, [editorTarget]);

  return (
    <div className="h-full min-h-0 flex flex-col overflow-auto">
      <RepoAssistantPanel apiUrl={apiUrl} className="h-full min-h-0 flex-1" />
    </div>
  );
}


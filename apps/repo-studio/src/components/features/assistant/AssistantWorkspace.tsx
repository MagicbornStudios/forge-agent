'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { RepoAssistantPanel } from '@/components/RepoAssistantPanel';

export interface AssistantWorkspaceProps {
  title: string;
  editorTarget: 'loop-assistant' | 'codex-assistant';
}

export function AssistantWorkspace({
  title,
  editorTarget,
}: AssistantWorkspaceProps) {
  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('editorTarget', editorTarget);
    return `/api/assistant-chat?${params.toString()}`;
  }, [editorTarget]);

  return (
    <div className="h-full min-h-0 overflow-auto p-2">
      <div className="flex min-h-full flex-col gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <p>System prompt comes from settings for the active loop.</p>
            <p>Attach planning context inline in chat input with <code>@planning/&lt;doc-id-or-slug&gt;</code>.</p>
          </CardContent>
        </Card>

        <div className="min-h-0 flex-1 rounded-md border border-border bg-background">
          <RepoAssistantPanel apiUrl={apiUrl} className="h-full" />
        </div>
      </div>
    </div>
  );
}

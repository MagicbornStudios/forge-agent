'use client';

import * as React from 'react';
import { DevToolsHooks } from '@assistant-ui/react';
import { Button } from '@forge/ui/button';
import { ScrollArea } from '@forge/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface AssistantDevToolsPanelProps {
  className?: string;
}

export function AssistantDevToolsPanel({ className }: AssistantDevToolsPanelProps) {
  const [, forceUpdate] = React.useState(0);

  React.useEffect(() => {
    return DevToolsHooks.subscribe(() => {
      forceUpdate((tick) => tick + 1);
    });
  }, []);

  const entries = Array.from(DevToolsHooks.getApis().entries());

  if (entries.length === 0) {
    return (
      <div className={cn('text-xs text-muted-foreground', className)}>
        No assistant runtime detected. Open the Assistant tab to initialize the chat runtime.
      </div>
    );
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-3', className)}>
      {entries.map(([apiId, entry]) => (
        <div key={apiId} className="rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
          <div className="flex items-center justify-between gap-[var(--control-gap)]">
            <div className="font-medium">Assistant runtime #{apiId}</div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => DevToolsHooks.clearEventLogs(apiId)}
              className="h-6"
            >
              Clear
            </Button>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Events: {entry.logs.length}
          </div>
          <ScrollArea className="mt-2 h-[220px] rounded border border-border/40 bg-background/60 p-2">
            {entry.logs.length === 0 ? (
              <div className="text-[11px] text-muted-foreground">No events yet.</div>
            ) : (
              <div className="space-y-2 font-mono text-[11px]">
                {entry.logs.slice(-50).map((log, index) => (
                  <div key={`${apiId}-${index}`} className="space-y-1">
                    <div className="text-[10px] text-muted-foreground">
                      {log.time.toLocaleTimeString()} · {log.event}
                    </div>
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}

'use client';

import * as React from 'react';
import { useCopilotSidebar } from '@/components/providers/CopilotKitProvider';
import { useModelRouterStore } from '@/lib/model-router/store';
import { useSettingsStore } from '@/lib/settings/store';
import { Button } from '@forge/ui/button';
import { Badge } from '@forge/ui/badge';
import { cn } from '@/lib/utils';

export interface CopilotKitDevToolsPanelProps {
  className?: string;
}

export function CopilotKitDevToolsPanel({ className }: CopilotKitDevToolsPanelProps) {
  const { isOpen, setIsOpen } = useCopilotSidebar();
  const { mode, activeModelId, fallbackIds } = useModelRouterStore();
  const responsesCompatOnly = useSettingsStore((s) => s.getSettingValue('ai.responsesCompatOnly')) as
    | boolean
    | undefined;

  return (
    <div className={cn('flex h-full min-h-0 flex-col gap-3 text-xs', className)}>
      <div className="rounded-md border border-border/60 bg-muted/20 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium">CopilotKit sidebar</div>
          <Button size="xs" variant="outline" onClick={() => setIsOpen(!isOpen)} className="h-6">
            {isOpen ? 'Close' : 'Open'}
          </Button>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Status: {isOpen ? 'Open' : 'Closed'}
        </div>
      </div>

      <div className="rounded-md border border-border/60 bg-muted/20 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium">Model routing</div>
          <Badge variant="outline" className="text-[10px] uppercase">
            {mode}
          </Badge>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Primary: <span className="text-foreground">{activeModelId}</span>
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Fallbacks: {fallbackIds.length}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground">
          Responses v2 filter: {responsesCompatOnly === false ? 'Off' : 'On'}
        </div>
      </div>

      <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground">
        CopilotKit BuiltInAgent uses the OpenAI responses API. If the selected model is incompatible,
        the runtime will automatically fall back to a responses-v2 compatible model.
      </div>
    </div>
  );
}

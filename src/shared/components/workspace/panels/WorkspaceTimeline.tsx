'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface WorkspaceTimelineProps {
  children?: React.ReactNode;
  className?: string;
}

/** Optional timeline slot (tracks + clips). Only rendered when provided to WorkspacePanels. */
export function WorkspaceTimeline({ children, className }: WorkspaceTimelineProps) {
  return (
    <div
      role="region"
      aria-label="Timeline"
      className={cn('flex min-h-[120px] flex-col border-t border-border bg-muted', className)}
    >
      <ScrollArea className="h-full">
        <div className="p-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { ScrollArea } from '@forge/ui/scroll-area';

export interface EditorBottomPanelProps {
  children?: React.ReactNode;
  className?: string;
}

/** Optional bottom surface: logs, timeline, etc. Only rendered when provided. */
export function EditorBottomPanel({ children, className }: EditorBottomPanelProps) {
  return (
    <div
      role="region"
      aria-label="Bottom panel"
      className={cn(
        'flex min-h-[120px] max-h-[280px] flex-col border-t border-border bg-muted',
        className,
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-2">{children}</div>
      </ScrollArea>
    </div>
  );
}

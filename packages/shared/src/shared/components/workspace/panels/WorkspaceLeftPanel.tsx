'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface WorkspaceLeftPanelProps {
  children?: React.ReactNode;
  className?: string;
}

/** Left surface: library, palette, navigator (graphs list, pages tree, characters list). */
export function WorkspaceLeftPanel({ children, className }: WorkspaceLeftPanelProps) {
  return (
    <aside
      className={cn(
        'flex min-w-[280px] max-w-[320px] flex-col border-r border-border bg-background',
        className
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-3">{children}</div>
      </ScrollArea>
    </aside>
  );
}

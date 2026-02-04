'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface WorkspaceSidebarProps {
  children?: React.ReactNode;
  className?: string;
}

export function WorkspaceSidebar({ children, className }: WorkspaceSidebarProps) {
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

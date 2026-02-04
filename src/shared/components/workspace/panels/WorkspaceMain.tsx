'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface WorkspaceMainProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Main editor area. No ScrollArea by default so embedded editors (React Flow, Lexical, etc.)
 * control their own viewport. Pass scrollable content or wrap in ScrollArea when needed.
 */
export function WorkspaceMain({ children, className }: WorkspaceMainProps) {
  return (
    <main className={cn('relative flex-1 min-w-0 overflow-hidden bg-background', className)}>
      {children}
    </main>
  );
}

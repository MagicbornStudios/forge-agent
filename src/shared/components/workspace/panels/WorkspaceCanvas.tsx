'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface WorkspaceCanvasProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Canvas: the editor surface (React Flow, Lexical, JointJS, Twick).
 * No ScrollArea so embedded editors control their own viewport.
 */
export function WorkspaceCanvas({ children, className }: WorkspaceCanvasProps) {
  return (
    <main
      className={cn('relative flex-1 min-w-0 overflow-hidden bg-background', className)}
    >
      {children}
    </main>
  );
}

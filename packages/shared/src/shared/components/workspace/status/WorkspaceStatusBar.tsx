'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceStatusBarProps {
  children?: React.ReactNode;
  className?: string;
}

export function WorkspaceStatusBar({ children, className }: WorkspaceStatusBarProps) {
  return (
    <footer
      role="status"
      className={cn('min-h-6 flex items-center px-3 text-xs text-muted-foreground border-t border-border bg-muted', className)}
    >
      {children}
    </footer>
  );
}

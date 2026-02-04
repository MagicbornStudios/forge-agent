'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface WorkspaceLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

/** Simple flex column layout for the shell content (header, toolbar, panels, status). */
export function WorkspaceLayout({ children, className }: WorkspaceLayoutProps) {
  return (
    <div className={cn('flex flex-col h-full min-h-0', className)}>
      {children}
    </div>
  );
}

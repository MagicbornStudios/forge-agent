'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface WorkspaceHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

function HeaderRoot({ children, className }: WorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        'flex min-h-12 items-center border-b border-border bg-background px-4 gap-4',
        className
      )}
    >
      {children}
    </header>
  );
}

function HeaderLeft({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center shrink-0', className)}>{children}</div>;
}
function HeaderCenter({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center flex-1 min-w-0 justify-center', className)}>{children}</div>;
}
function HeaderRight({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center shrink-0', className)}>{children}</div>;
}

export const WorkspaceHeader = Object.assign(HeaderRoot, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});

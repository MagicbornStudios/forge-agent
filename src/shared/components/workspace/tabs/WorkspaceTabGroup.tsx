'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface WorkspaceTabGroupProps {
  children?: React.ReactNode;
  className?: string;
  label?: string;
  actions?: React.ReactNode;
  tabListClassName?: string;
}

export function WorkspaceTabGroup({
  children,
  className,
  label,
  actions,
  tabListClassName,
}: WorkspaceTabGroupProps) {
  return (
    <div className={cn('flex items-end border-b border-border bg-muted/40 px-2 py-1.5', className)}>
      <div role="tablist" aria-label={label} className={cn('flex items-end gap-1', tabListClassName)}>
        {children}
      </div>
      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </div>
  );
}

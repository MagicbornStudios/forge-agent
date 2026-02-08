'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface EditorTabGroupProps {
  children?: React.ReactNode;
  className?: string;
  label?: string;
  actions?: React.ReactNode;
  tabListClassName?: string;
}

export function EditorTabGroup({
  children,
  className,
  label,
  actions,
  tabListClassName,
}: EditorTabGroupProps) {
  return (
    <div className={cn('flex items-end border-b border-border bg-muted/40 pl-[var(--panel-padding)] pr-2 py-[var(--control-padding-y)]', className)}>
      <div
        role="tablist"
        aria-label={label}
        className={cn('flex items-end gap-[var(--control-gap)]', tabListClassName)}
      >
        {children}
      </div>
      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </div>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface EditorTabGroupProps {
  children?: React.ReactNode;
  className?: string;
  label?: string;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  tabListClassName?: string;
}

export function EditorTabGroup({
  children,
  className,
  label,
  leading,
  actions,
  tabListClassName,
}: EditorTabGroupProps) {
  return (
    <div className={cn('flex items-end border-b-2 border-[var(--context-accent)] bg-muted/40 pl-[var(--panel-padding)] pr-[var(--panel-padding)] py-[var(--control-padding-y)]', className)}>
      {leading && <div className="flex items-center gap-[var(--control-gap)] shrink-0">{leading}</div>}
      <div
        role="tablist"
        aria-label={label}
        className={cn('flex items-end gap-[var(--control-gap)]', tabListClassName)}
      >
        {children}
      </div>
      {actions && <div className="ml-auto flex items-center gap-[var(--control-gap)]">{actions}</div>}
    </div>
  );
}

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
    <div
      className={cn(
        'grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b-2 border-[var(--context-accent)] bg-muted/40',
        'gap-x-[var(--control-gap,0.375rem)] px-[var(--panel-padding,0.625rem)] py-[calc(var(--control-padding-y,0.25rem)+0.125rem)]',
        className,
      )}
    >
      {leading && (
        <div className="col-start-1 row-start-1 flex min-w-0 items-center justify-start gap-[var(--control-gap,0.375rem)] pr-[calc(var(--control-gap,0.375rem)*2)]">
          {leading}
        </div>
      )}
      <div
        role="tablist"
        aria-label={label}
        className={cn(
          'col-start-2 row-start-1 flex min-w-0 max-w-full items-end justify-center gap-[var(--control-gap,0.375rem)] px-[var(--control-gap,0.375rem)]',
          tabListClassName,
        )}
      >
        {children}
      </div>
      {actions && (
        <div className="col-start-3 row-start-1 ml-auto flex min-w-0 shrink-0 items-center justify-end gap-[var(--control-gap,0.375rem)] pl-[calc(var(--control-gap,0.375rem)*2)]">
          {actions}
        </div>
      )}
    </div>
  );
}

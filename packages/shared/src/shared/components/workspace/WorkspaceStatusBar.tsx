'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceStatusBarProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * WorkspaceStatusBar — the bottom status bar of an editor.
 *
 * Legacy rename hard-cut complete. Displays read-only contextual
 * information such as node counts, selection state, dirty indicators.
 *
 * @example
 * ```tsx
 * <WorkspaceStatusBar>
 *   42 nodes &middot; 3 selected
 *   {isDirty && <span className="ml-2 text-amber-500">Unsaved</span>}
 * </WorkspaceStatusBar>
 * ```
 */
export function WorkspaceStatusBar({ children, className }: WorkspaceStatusBarProps) {
  return (
    <footer
      role="status"
      className={cn(
        'min-h-[var(--status-height)] flex items-center px-[var(--panel-padding)] text-[11px] text-muted-foreground border-t-2 border-[var(--context-accent)] bg-muted shrink-0',
        className,
      )}
    >
      {children}
    </footer>
  );
}

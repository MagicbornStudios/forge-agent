'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface ModeStatusBarProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * ModeStatusBar — the bottom status bar of an editor mode.
 *
 * Replaces `WorkspaceStatusBar`. Displays read-only contextual
 * information such as node counts, selection state, dirty indicators.
 *
 * @example
 * ```tsx
 * <ModeStatusBar>
 *   42 nodes &middot; 3 selected
 *   {isDirty && <span className="ml-2 text-amber-500">Unsaved</span>}
 * </ModeStatusBar>
 * ```
 */
export function ModeStatusBar({ children, className }: ModeStatusBarProps) {
  return (
    <footer
      role="status"
      className={cn(
        'min-h-6 flex items-center px-3 text-xs text-muted-foreground border-t border-border bg-muted shrink-0',
        className,
      )}
    >
      {children}
    </footer>
  );
}

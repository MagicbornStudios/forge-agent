'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface EditorStatusBarProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * EditorStatusBar — the bottom status bar of an editor.
 *
 * Replaces `WorkspaceStatusBar`. Displays read-only contextual
 * information such as node counts, selection state, dirty indicators.
 *
 * @example
 * ```tsx
 * <EditorStatusBar>
 *   42 nodes &middot; 3 selected
 *   {isDirty && <span className="ml-2 text-amber-500">Unsaved</span>}
 * </EditorStatusBar>
 * ```
 */
export function EditorStatusBar({ children, className }: EditorStatusBarProps) {
  return (
    <footer
      role="status"
      className={cn(
        'min-h-[var(--status-height)] flex items-center px-[var(--panel-padding)] text-[11px] text-muted-foreground border-t border-border bg-muted shrink-0',
        className,
      )}
    >
      {children}
    </footer>
  );
}

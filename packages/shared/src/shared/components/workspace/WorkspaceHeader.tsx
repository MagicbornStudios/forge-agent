'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * WorkspaceHeader — the title bar of an editor.
 *
 * Legacy rename hard-cut complete. Compound component with `.Left`, `.Center`,
 * `.Right` slots for composition.
 *
 * @example
 * ```tsx
 * <WorkspaceHeader>
 *   <WorkspaceHeader.Left>
 *     <h1 className="text-lg font-bold">Forge</h1>
 *   </WorkspaceHeader.Left>
 *   <WorkspaceHeader.Center>
 *     <span className="text-sm text-muted-foreground">My Narrative</span>
 *   </WorkspaceHeader.Center>
 * </WorkspaceHeader>
 * ```
 */
function HeaderRoot({ children, className }: WorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        'flex min-h-[var(--header-height)] items-center border-b-2 border-[var(--context-accent)] bg-background px-[var(--panel-padding)] gap-[var(--control-gap)] shrink-0',
        className,
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
  return (
    <div className={cn('flex items-center flex-1 min-w-0 justify-center', className)}>
      {children}
    </div>
  );
}

function HeaderRight({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center shrink-0', className)}>{children}</div>;
}

export const WorkspaceHeader = Object.assign(HeaderRoot, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});

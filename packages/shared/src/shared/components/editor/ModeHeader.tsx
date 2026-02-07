'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface ModeHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * ModeHeader — the title bar of an editor mode.
 *
 * Replaces `WorkspaceHeader`. Compound component with `.Left`, `.Center`,
 * `.Right` slots for composition.
 *
 * @example
 * ```tsx
 * <ModeHeader>
 *   <ModeHeader.Left>
 *     <h1 className="text-lg font-bold">Forge</h1>
 *   </ModeHeader.Left>
 *   <ModeHeader.Center>
 *     <span className="text-sm text-muted-foreground">My Narrative</span>
 *   </ModeHeader.Center>
 * </ModeHeader>
 * ```
 */
function HeaderRoot({ children, className }: ModeHeaderProps) {
  return (
    <header
      className={cn(
        'flex min-h-12 items-center border-b border-border bg-background px-4 gap-4 shrink-0',
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

export const ModeHeader = Object.assign(HeaderRoot, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});

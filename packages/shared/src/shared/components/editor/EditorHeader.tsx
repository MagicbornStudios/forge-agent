'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface EditorHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * EditorHeader — the title bar of an editor.
 *
 * Replaces `WorkspaceHeader`. Compound component with `.Left`, `.Center`,
 * `.Right` slots for composition.
 *
 * @example
 * ```tsx
 * <EditorHeader>
 *   <EditorHeader.Left>
 *     <h1 className="text-lg font-bold">Forge</h1>
 *   </EditorHeader.Left>
 *   <EditorHeader.Center>
 *     <span className="text-sm text-muted-foreground">My Narrative</span>
 *   </EditorHeader.Center>
 * </EditorHeader>
 * ```
 */
function HeaderRoot({ children, className }: EditorHeaderProps) {
  return (
    <header
      className={cn(
        'flex min-h-[var(--header-height)] items-center border-b border-border bg-background px-[var(--panel-padding)] gap-[var(--control-gap)] shrink-0',
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

export const EditorHeader = Object.assign(HeaderRoot, {
  Left: HeaderLeft,
  Center: HeaderCenter,
  Right: HeaderRight,
});

'use client';

import * as React from 'react';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceReviewBarProps {
  /** When false, render nothing. */
  visible: boolean;
  onRevert: () => void;
  onAccept: () => void;
  label?: string;
  revertLabel?: string;
  acceptLabel?: string;
  className?: string;
}

/**
 * Declarative bar for plan–commit review: Revert (reset draft) and Accept (keep draft, clear pending).
 * Place between Toolbar and LayoutGrid. State (isDirty, pendingFromPlan) is owned by the workspace/domain store.
 */
export function WorkspaceReviewBar({
  visible,
  onRevert,
  onAccept,
  label = 'Pending changes from plan',
  revertLabel = 'Revert',
  acceptLabel = 'Accept',
  className,
}: WorkspaceReviewBarProps) {
  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Review pending changes"
      className={cn(
        'flex items-center justify-between gap-2 px-3 py-1.5 text-sm border-b border-border bg-muted/60',
        className
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRevert}>
          {revertLabel}
        </Button>
        <Button variant="secondary" size="sm" onClick={onAccept}>
          {acceptLabel}
        </Button>
      </div>
    </div>
  );
}

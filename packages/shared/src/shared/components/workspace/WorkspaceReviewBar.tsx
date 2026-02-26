'use client';

import * as React from 'react';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceReviewBarProps {
  /** When false, render nothing. */
  visible: boolean;
  /** Revert callback — reset to last saved state. */
  onRevert: () => void;
  /** Accept callback — keep AI changes, clear pending flag. */
  onAccept: () => void;
  /** Descriptive label for the pending changes. */
  label?: string;
  revertLabel?: string;
  acceptLabel?: string;
  className?: string;
}

/**
 * WorkspaceReviewBar — a plan/commit review bar for AI-generated changes.
 *
 * Legacy rename hard-cut complete. Renders between the `WorkspaceToolbar`
 * and the `WorkspaceLayout` when there are pending AI changes to review.
 *
 * @example
 * ```tsx
 * <WorkspaceReviewBar
 *   visible={isDirty && hasPendingPlan}
 *   onRevert={handleRevert}
 *   onAccept={handleAccept}
 *   label="AI generated 5 new nodes"
 * />
 * ```
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
        'flex items-center justify-between gap-[var(--control-gap)] px-[var(--panel-padding)] py-[var(--control-padding-y)] text-sm border-b-2 border-[var(--context-accent)] bg-muted/60 shrink-0',
        className,
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <div className="flex gap-[var(--control-gap)]">
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

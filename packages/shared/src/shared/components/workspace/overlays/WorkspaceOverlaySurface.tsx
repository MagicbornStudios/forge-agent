'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@forge/ui/dialog';
import type { OverlaySpec, ActiveOverlay } from '@forge/shared/workspace';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceOverlaySurfaceProps {
  /** Declarative overlay list; one place per workspace. No registry. */
  overlays: OverlaySpec[];
  /** Current overlay from workspace state. */
  activeOverlay: ActiveOverlay | null;
  onDismiss: () => void;
  className?: string;
}

const sizeClasses: Record<NonNullable<OverlaySpec['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-[90vw] max-h-[90vh] w-full',
};

/**
 * Renders the active overlay from the declarative overlays list.
 * No file scanning or registry; workspace declares overlays in one place.
 */
export function WorkspaceOverlaySurface({
  overlays,
  activeOverlay,
  onDismiss,
  className,
}: WorkspaceOverlaySurfaceProps) {
  const spec = activeOverlay
    ? overlays.find((o) => o.id === activeOverlay.id)
    : null;
  const open = spec != null;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) onDismiss();
    },
    [onDismiss]
  );

  if (!spec) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(sizeClasses[spec.size ?? 'md'], className)}
        onPointerDownOutside={onDismiss}
        onEscapeKeyDown={onDismiss}
      >
        {spec.title && (
          <DialogHeader>
            <DialogTitle>{spec.title}</DialogTitle>
          </DialogHeader>
        )}
        {spec.render({
          payload: activeOverlay?.payload,
          onDismiss,
        })}
      </DialogContent>
    </Dialog>
  );
}

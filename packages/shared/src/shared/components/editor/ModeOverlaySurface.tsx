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

export interface ModeOverlaySurfaceProps {
  /** Declarative overlay list; one place per mode. No registry. */
  overlays: OverlaySpec[];
  /** Current overlay from mode state. */
  activeOverlay: ActiveOverlay | null;
  /** Dismiss the active overlay. */
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
 * ModeOverlaySurface — renders modal overlays for an editor mode.
 *
 * Replaces `WorkspaceOverlaySurface`. Matches the active overlay
 * from mode state to the declarative overlay specs and renders it
 * in a shadcn `Dialog`.
 *
 * @example
 * ```tsx
 * <ModeOverlaySurface
 *   overlays={[
 *     {
 *       id: 'create-node',
 *       type: 'modal',
 *       title: 'Create Node',
 *       size: 'md',
 *       render: ({ onDismiss }) => <CreateNodeForm onClose={onDismiss} />,
 *     },
 *   ]}
 *   activeOverlay={activeOverlay}
 *   onDismiss={dismissOverlay}
 * />
 * ```
 */
export function ModeOverlaySurface({
  overlays,
  activeOverlay,
  onDismiss,
  className,
}: ModeOverlaySurfaceProps) {
  const spec = activeOverlay
    ? overlays.find((o) => o.id === activeOverlay.id)
    : null;
  const open = spec != null;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) onDismiss();
    },
    [onDismiss],
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

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@forge/ui/dialog';
import type { OverlaySpec, ActiveOverlay } from '../../workspace';
import { cn } from '@forge/shared/lib/utils';

export interface EditorOverlaySurfaceProps {
  /** Declarative overlay list; one place per editor. No registry. */
  overlays: OverlaySpec[];
  /** Current overlay from editor state. */
  activeOverlay: ActiveOverlay | null;
  /** Dismiss the active overlay. */
  onDismiss: () => void;
  className?: string;
}

const sizeClasses: Record<NonNullable<OverlaySpec['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  full: 'w-[var(--dialog-max-w-full)] max-h-[var(--dialog-max-h-full)]',
};

/**
 * EditorOverlaySurface — renders modal overlays for an editor.
 *
 * Replaces `WorkspaceOverlaySurface`. Matches the active overlay
 * from editor state to the declarative overlay specs and renders it
 * in a shadcn `Dialog`.
 *
 * @example
 * ```tsx
 * <EditorOverlaySurface
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
export function EditorOverlaySurface({
  overlays,
  activeOverlay,
  onDismiss,
  className,
}: EditorOverlaySurfaceProps) {
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
        className={cn(
          sizeClasses[spec.size ?? 'md'],
          'max-h-[90vh] overflow-y-auto',
          '[&>button]:right-[var(--panel-padding)] [&>button]:top-[var(--panel-padding)]',
          className,
        )}
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

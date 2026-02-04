'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ModalRoute, ModalRegistry } from '@forge/shared/workspace';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceModalsHostProps {
  /** Current modal stack; top item is visible. */
  modalStack: ModalRoute[];
  /** Modal key -> render function. */
  registry: ModalRegistry;
  onClose: (key: string) => void;
  className?: string;
}

const sizeClasses: Record<NonNullable<ModalRoute['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-[90vw] max-h-[90vh] w-full',
};

/**
 * Renders the top modal from modalStack using the registry. Uses shadcn Dialog.
 */
export function WorkspaceModalsHost({
  modalStack,
  registry,
  onClose,
  className,
}: WorkspaceModalsHostProps) {
  const route = modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
  const open = route !== null;
  const RenderModal = route ? registry.get(route.key) : null;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open && route) onClose(route.key);
    },
    [onClose, route]
  );

  if (!route || !RenderModal) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(sizeClasses[route.size ?? 'md'], className)}
        onPointerDownOutside={() => onClose(route.key)}
        onEscapeKeyDown={() => onClose(route.key)}
      >
        {route.title && (
          <DialogHeader>
            <DialogTitle>{route.title}</DialogTitle>
          </DialogHeader>
        )}
        <RenderModal
          route={route}
          onClose={() => onClose(route.key)}
        />
      </DialogContent>
    </Dialog>
  );
}

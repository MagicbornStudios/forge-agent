'use client';

import * as React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/ui/lib/utils';

export interface LockedOverlayProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function LockedOverlay({
  title = 'Locked',
  description,
  actionLabel = 'Upgrade',
  onAction,
  className,
}: LockedOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex max-w-xs flex-col items-center gap-3 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted">
          <Lock className="h-5 w-5" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {onAction && (
          <Button size="sm" variant="default" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

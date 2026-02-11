'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/shared/lib/utils';

interface GraphEditorToolbarProps {
  label: string;
  onCreateNew?: () => void;
  className?: string;
}

export function GraphEditorToolbar({ label, onCreateNew, className }: GraphEditorToolbarProps) {
  return (
    <div className={cn('flex items-center gap-[var(--control-gap)]', className)}>
      {onCreateNew && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          title={`Create a new ${label.toLowerCase()}`}
          onClick={onCreateNew}
          className="h-[var(--control-height-sm)] px-[var(--control-padding-x)] text-xs border-border text-foreground"
        >
          <Plus className="mr-1.5 size-[var(--icon-size)] shrink-0" />
          New {label}
        </Button>
      )}
    </div>
  );
}

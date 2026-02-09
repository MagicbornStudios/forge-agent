'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@forge/ui/tooltip';
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateNew}
              className="h-7 px-[var(--control-padding-x)] text-xs border-border text-foreground"
              title={`Create a new ${label.toLowerCase()}`}
            >
              <Plus className="size-3 mr-1.5 shrink-0" />
              New {label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a new {label.toLowerCase()}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

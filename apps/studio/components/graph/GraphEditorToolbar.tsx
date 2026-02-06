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
    <div className={cn('flex items-center gap-2', className)}>
      {onCreateNew && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCreateNew}
              className="h-7 px-2 text-xs"
              title={`Create a new ${label.toLowerCase()}`}
            >
              <Plus className="h-4 w-4 mr-1.5" />
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

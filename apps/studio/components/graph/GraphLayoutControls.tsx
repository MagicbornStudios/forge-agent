'use client';

import React from 'react';
import { Panel } from 'reactflow';
import { Focus, Maximize2 } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/shared/lib/utils';

interface GraphLayoutControlsProps {
  onFitView?: () => void;
  onFitSelection?: () => void;
  className?: string;
}

export function GraphLayoutControls({ onFitView, onFitSelection, className }: GraphLayoutControlsProps) {
  if (!onFitView && !onFitSelection) return null;

  return (
    <Panel position="top-right" className={cn('!bg-transparent !border-0 !p-0 !m-2', className)}>
      <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-[var(--panel-padding)] shadow-[var(--shadow-md)]">
        {onFitView && (
          <Button
            variant="outline"
            size="icon"
            className="size-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Fit view"
            onClick={onFitView}
          >
            <Maximize2 className="size-3.5" />
          </Button>
        )}
        {onFitSelection && (
          <Button
            variant="outline"
            size="icon"
            className="size-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Fit selection"
            onClick={onFitSelection}
          >
            <Focus className="size-3.5" />
          </Button>
        )}
      </div>
    </Panel>
  );
}

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
    <Panel position="top-right" className={cn('!bg-transparent !border-0 !p-0 !m-[var(--panel-padding)]', className)}>
      <div className="flex items-center gap-[var(--control-gap)] bg-card border border-border rounded-lg p-[var(--panel-padding)] shadow-[var(--shadow-md)]">
        {onFitView && (
          <Button
            variant="outline"
            size="icon"
            className="size-[var(--control-height)] border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Fit view"
            onClick={onFitView}
          >
            <Maximize2 className="size-[var(--icon-size)]" />
          </Button>
        )}
        {onFitSelection && (
          <Button
            variant="outline"
            size="icon"
            className="size-[var(--control-height)] border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Fit selection"
            onClick={onFitSelection}
          >
            <Focus className="size-[var(--icon-size)]" />
          </Button>
        )}
      </div>
    </Panel>
  );
}

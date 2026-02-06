'use client';

import React from 'react';
import { Panel } from 'reactflow';
import { Maximize2, Focus } from 'lucide-react';
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
      <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1.5 shadow-lg">
        {onFitView && (
          <button
            onClick={onFitView}
            className="p-1.5 rounded bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Fit view"
          >
            <Maximize2 size={14} />
          </button>
        )}
        {onFitSelection && (
          <button
            onClick={onFitSelection}
            className="p-1.5 rounded bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Fit selection"
          >
            <Focus size={14} />
          </button>
        )}
      </div>
    </Panel>
  );
}

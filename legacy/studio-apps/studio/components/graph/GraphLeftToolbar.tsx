'use client';

import React from 'react';
import { Panel } from 'reactflow';
import { Focus, Map } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/shared/lib/utils';

interface GraphLeftToolbarProps {
  showMiniMap?: boolean;
  onToggleMiniMap?: () => void;
  onFitView?: () => void;
  className?: string;
}

export function GraphLeftToolbar({
  showMiniMap,
  onToggleMiniMap,
  onFitView,
  className,
}: GraphLeftToolbarProps) {
  if (!onToggleMiniMap && !onFitView) return null;

  return (
    <Panel position="top-left" className={cn('!bg-transparent !border-0 !p-0 !m-[var(--panel-padding)]', className)}>
      <div className="flex flex-col gap-[var(--control-gap)] bg-card border border-border rounded-lg p-[var(--panel-padding)] shadow-[var(--shadow-md)]">
        {onFitView && (
          <Button
            variant="outline"
            size="icon"
            className="size-[var(--control-height)] border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Fit view"
            onClick={onFitView}
          >
            <Focus className="size-[var(--icon-size)]" />
          </Button>
        )}
        {onToggleMiniMap && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'size-[var(--control-height)] transition-colors',
              showMiniMap
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={showMiniMap ? 'Hide minimap' : 'Show minimap'}
            onClick={onToggleMiniMap}
          >
            <Map className="size-[var(--icon-size)]" />
          </Button>
        )}
      </div>
    </Panel>
  );
}

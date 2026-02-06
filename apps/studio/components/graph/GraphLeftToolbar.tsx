'use client';

import React from 'react';
import { Panel } from 'reactflow';
import { Map, Focus } from 'lucide-react';
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
    <Panel position="top-left" className={cn('!bg-transparent !border-0 !p-0 !m-2', className)}>
      <div className="flex flex-col gap-1.5 bg-[var(--color-df-sidebar-bg)] border border-[var(--color-df-sidebar-border)] rounded-lg p-1.5 shadow-lg">
        {onFitView && (
          <button
            onClick={onFitView}
            className="p-1.5 rounded bg-[var(--color-df-elevated)] border border-[var(--color-df-control-border)] text-muted-foreground hover:text-foreground hover:border-[var(--color-df-control-hover)] transition-colors"
            title="Fit view"
          >
            <Focus size={14} />
          </button>
        )}
        {onToggleMiniMap && (
          <button
            onClick={onToggleMiniMap}
            className={cn(
              'p-1.5 rounded transition-colors',
              showMiniMap
                ? 'bg-[color-mix(in_oklab,var(--color-df-border-active)_20%,transparent)] text-foreground border border-[var(--color-df-border-active)]'
                : 'bg-[var(--color-df-elevated)] border border-[var(--color-df-control-border)] text-muted-foreground hover:text-foreground hover:border-[var(--color-df-control-hover)]'
            )}
            title={showMiniMap ? 'Hide minimap' : 'Show minimap'}
          >
            <Map size={14} />
          </button>
        )}
      </div>
    </Panel>
  );
}

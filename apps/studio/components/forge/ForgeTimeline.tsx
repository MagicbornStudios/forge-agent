'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { forgeGraphToTimelineModel } from '@/lib/forge-to-timeline';
import type { ForgeGraphDoc } from '@forge/types/graph';
import { Button } from '@forge/ui/button';

export interface ForgeTimelineProps {
  graph: ForgeGraphDoc | null;
  selectedNodeIds?: string[];
  onSelectNode?: (nodeId: string) => void;
  className?: string;
}

export function ForgeTimeline({
  graph,
  selectedNodeIds = [],
  onSelectNode,
  className,
}: ForgeTimelineProps) {
  const model = React.useMemo(() => forgeGraphToTimelineModel(graph), [graph]);
  const elements = model.tracks.flatMap((t) => t.elements);

  if (!graph || elements.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full min-h-[72px] text-muted-foreground text-sm', className)}>
        No nodes in sequence
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto p-2 min-h-[72px] border-t bg-muted/30',
        className
      )}
      role="list"
      aria-label="Graph sequence timeline"
    >
      {elements.map((el) => {
        const nodeId = el.meta?.nodeId ?? el.id.replace(/^el-/, '');
        const isSelected = selectedNodeIds.includes(nodeId);
        return (
          <Button
            key={el.id}
            type="button"
            role="listitem"
            onClick={() => onSelectNode?.(nodeId)}
            variant="outline"
            size="sm"
            className={cn(
              'flex-shrink-0 h-auto flex-col items-start gap-1 px-3 py-2 text-left text-sm transition-colors',
              'bg-background hover:bg-muted/80',
              isSelected ? 'ring-2 ring-primary border-primary' : 'border-border'
            )}
          >
            <span className="font-medium truncate max-w-[140px] block">{el.label}</span>
            <span className="text-xs text-muted-foreground">{el.meta?.type ?? 'node'}</span>
          </Button>
        );
      })}
    </div>
  );
}


'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForgeNode } from '@forge/types/graph';
import { cn } from '@forge/ui/lib/utils';

export const PlayerNode = memo(({ data, selected }: NodeProps<ForgeNode>) => {
  return (
    <div
      data-node-type="player"
      data-selected={selected || undefined}
      className={cn(
        'forge-graph-node px-4 py-2 shadow-[var(--shadow-md)] rounded-md border-2 min-w-[200px]',
        'bg-[var(--graph-node-player-bg)] border-[var(--graph-node-player-border)]',
        selected && '[box-shadow:var(--shadow-md),inset_0_0_0_2px_var(--graph-node-player-selected)]'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col">
        <div className="text-xs font-bold uppercase" style={{ color: 'var(--graph-node-player-header)' }}>
          Player
        </div>
        {data.label && (
          <div className="text-sm font-semibold mt-1" style={{ color: 'var(--graph-node-player-text)' }}>
            {data.label}
          </div>
        )}
        {data.choices && data.choices.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">Choices:</div>
            <ul className="text-xs space-y-1" style={{ color: 'var(--graph-node-player-text)' }}>
              {data.choices.map((choice) => (
                <li key={choice.id} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{choice.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

PlayerNode.displayName = 'PlayerNode';


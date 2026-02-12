'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForgeNode } from '@forge/types/graph';
import { cn } from '@forge/ui/lib/utils';

export const CharacterNode = memo(({ data, selected }: NodeProps<ForgeNode>) => {
  return (
    <div
      data-node-type="character"
      data-selected={selected || undefined}
      className={cn(
        'forge-graph-node px-4 py-2 shadow-[var(--shadow-md)] rounded-md border-2 min-w-[200px]',
        'bg-[var(--graph-node-npc-bg)] border-[var(--graph-node-npc-border)]',
        selected && '[box-shadow:var(--shadow-md),inset_0_0_0_2px_var(--graph-node-npc-selected)]'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col">
        <div className="text-xs font-bold uppercase" style={{ color: 'var(--graph-node-npc-header)' }}>
          Character
        </div>
        {data.speaker && (
          <div className="text-sm font-semibold mt-1" style={{ color: 'var(--graph-node-npc-text)' }}>
            {data.speaker}
          </div>
        )}
        {data.label && (
          <div className="text-xs text-muted-foreground">{data.label}</div>
        )}
        {data.content && (
          <div className="text-sm mt-2" style={{ color: 'var(--graph-node-npc-text)' }}>
            {data.content}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

CharacterNode.displayName = 'CharacterNode';


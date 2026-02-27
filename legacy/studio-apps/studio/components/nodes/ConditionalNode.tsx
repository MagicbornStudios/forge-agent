'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForgeNode } from '@forge/types/graph';
import { cn } from '@forge/ui/lib/utils';

export const ConditionalNode = memo(({ data, selected }: NodeProps<ForgeNode>) => {
  return (
    <div
      data-node-type="conditional"
      data-selected={selected || undefined}
      className={cn(
        'forge-graph-node px-4 py-2 shadow-[var(--shadow-md)] rounded-md border-2 min-w-[200px]',
        'bg-[var(--graph-node-conditional-bg)] border-[var(--graph-node-conditional-border)]',
        selected && '[box-shadow:var(--shadow-md),inset_0_0_0_2px_var(--graph-node-conditional-selected)]'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col">
        <div className="text-xs font-bold uppercase" style={{ color: 'var(--graph-node-conditional-header)' }}>
          Conditional
        </div>
        {data.label && (
          <div className="text-sm font-semibold mt-1" style={{ color: 'var(--graph-node-conditional-text)' }}>
            {data.label}
          </div>
        )}
        {data.content && (
          <div className="text-xs mt-2" style={{ color: 'var(--graph-node-conditional-text)' }}>
            {data.content}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3" style={{ left: '70%' }} />
    </div>
  );
});

ConditionalNode.displayName = 'ConditionalNode';


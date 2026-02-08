'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForgeNode } from '@forge/types/graph';

export const ConditionalNode = memo(({ data }: NodeProps<ForgeNode>) => {
  return (
    <div className="px-4 py-2 shadow-[var(--shadow-md)] rounded-md bg-card border-2 border-amber-500 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col">
        <div className="text-xs font-bold text-amber-600 uppercase">Conditional</div>
        {data.label && (
          <div className="text-sm font-semibold mt-1">{data.label}</div>
        )}
        {data.content && (
          <div className="text-xs mt-2 text-gray-600">{data.content}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3" style={{ left: '70%' }} />
    </div>
  );
});

ConditionalNode.displayName = 'ConditionalNode';


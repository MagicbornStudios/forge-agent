'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForgeNode } from '@forge/types/graph';

export const CharacterNode = memo(({ data }: NodeProps<ForgeNode>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col">
        <div className="text-xs font-bold text-purple-600 uppercase">Character</div>
        {data.speaker && (
          <div className="text-sm font-semibold mt-1">{data.speaker}</div>
        )}
        {data.label && (
          <div className="text-xs text-gray-500">{data.label}</div>
        )}
        {data.content && (
          <div className="text-sm mt-2">{data.content}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

CharacterNode.displayName = 'CharacterNode';


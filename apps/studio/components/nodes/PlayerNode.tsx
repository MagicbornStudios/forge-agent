'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForgeNode } from '@forge/types/graph';

export const PlayerNode = memo(({ data }: NodeProps<ForgeNode>) => {
  return (
    <div className="px-4 py-2 shadow-[var(--shadow-md)] rounded-md bg-card border-2 border-primary min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col">
        <div className="text-xs font-bold text-blue-600 uppercase">Player</div>
        {data.label && (
          <div className="text-sm font-semibold mt-1">{data.label}</div>
        )}
        {data.choices && data.choices.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Choices:</div>
            <ul className="text-xs space-y-1">
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


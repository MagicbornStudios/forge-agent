'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@forge/ui/lib/utils';
import type { CharacterCardNodeData } from '@/lib/domains/character/types';

const AI_HIGHLIGHT_CLASS = 'ring-2 ring-amber-400 ring-offset-2';

/**
 * Custom React Flow node representing a character in the relationship graph.
 *
 * Displays an avatar (image or initials), character name, and optional subtitle.
 * Visual states: active (primary ring), selected (blue ring), AI-highlighted (amber).
 */
export const CharacterCardNode = memo(function CharacterCardNode({
  data,
  selected,
}: NodeProps<CharacterCardNodeData>) {
  return (
    <div
      className={cn(
        'px-4 py-3 shadow-[var(--shadow-md)] rounded-lg border-2 min-w-[180px] bg-card transition-shadow',
        data.isActive
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-border',
        selected && !data.isActive && 'ring-2 ring-ring ring-offset-1',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground/60"
      />

      <div className="flex items-center gap-3">
        {/* Avatar */}
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.name}
            className="w-10 h-10 rounded-full object-cover border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground select-none">
            {data.initials}
          </div>
        )}

        {/* Text */}
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{data.name}</div>
          {data.subtitle && (
            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
              {data.subtitle}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-muted-foreground/60"
      />
    </div>
  );
});

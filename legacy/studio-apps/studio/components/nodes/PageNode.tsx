'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { ForgeNode, PageType } from '@forge/types/graph';
import { cn } from '@forge/ui/lib/utils';

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  ACT: 'Act',
  CHAPTER: 'Chapter',
  PAGE: 'Page',
};

export const PageNode = memo(({ data, selected }: NodeProps<ForgeNode>) => {
  const pageType = (data.pageType ?? 'PAGE') as PageType;
  const headerLabel = PAGE_TYPE_LABELS[pageType] ?? pageType;

  return (
    <div
      data-node-type="page"
      data-selected={selected || undefined}
      className={cn(
        'forge-graph-node px-4 py-2 shadow-[var(--shadow-md)] rounded-md border-2 min-w-[180px]',
        'bg-[var(--graph-node-page-bg)] border-[var(--graph-node-page-border)]',
        selected && '[box-shadow:var(--shadow-md),inset_0_0_0_2px_var(--graph-node-page-selected)]'
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex flex-col">
        <div className="text-xs font-bold uppercase" style={{ color: 'var(--graph-node-page-header)' }}>
          {headerLabel}
        </div>
        {data.label && (
          <div className="text-sm font-semibold mt-1" style={{ color: 'var(--graph-node-page-header)' }}>
            {data.label}
          </div>
        )}
        {data.content && (
          <div className="text-sm mt-2 opacity-90 line-clamp-2">{data.content}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

PageNode.displayName = 'PageNode';

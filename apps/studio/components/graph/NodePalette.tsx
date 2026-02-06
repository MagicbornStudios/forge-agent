'use client';

import React, { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@forge/ui/tooltip';
import { Boxes } from 'lucide-react';
import { cn } from '@forge/shared/lib/utils';
import { SectionHeader } from './SectionHeader';
import { useNodeDrag } from './useNodeDrag';

export interface NodePaletteItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  description?: string;
  dragType: string;
}

export interface NodePaletteProps {
  items: NodePaletteItem[];
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  focusedEditor?: 'narrative' | 'storylet' | null;
  categoryLabels?: Record<string, string>;
  onItemClick?: (item: NodePaletteItem) => void;
}

export function NodePalette({
  items,
  title = 'Nodes',
  icon,
  className,
  focusedEditor,
  categoryLabels,
  onItemClick,
}: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { setDraggedType } = useNodeDrag();

  const labels = {
    dialogue: 'Dialogue',
    structure: 'Structure',
    logic: 'Logic',
    entities: 'Entities',
    nodes: 'Nodes',
    ...(categoryLabels ?? {}),
  } as Record<string, string>;

  const groupedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        item.label.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query) ?? false)
      );
    });

    const grouped: Record<string, NodePaletteItem[]> = {};
    for (const item of filtered) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }
    return grouped;
  }, [items, searchQuery]);

  const handleDragStart = (event: React.DragEvent, item: NodePaletteItem) => {
    setDraggedType(item.dragType);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', item.dragType);
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (event: React.DragEvent) => {
    setDraggedType(null);
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '1';
    }
  };

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      <SectionHeader
        title={title}
        icon={icon ?? <Boxes size={14} />}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search nodes..."
        focusedEditor={focusedEditor}
      />
      <div className="flex-1 overflow-y-auto py-1">
        {Object.entries(groupedItems).map(([category, nodes]) => (
          <div key={category} className="mb-3">
            <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {labels[category] ?? category}
            </div>
            <div className="space-y-0.5">
              {nodes.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onItemClick?.(item)}
                      className={cn(
                        'flex w-full items-center gap-2 px-2 py-1.5 text-xs text-left',
                        'cursor-grab active:cursor-grabbing rounded transition-colors',
                        'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="font-medium truncate">{item.label}</span>
                    </button>
                  </TooltipTrigger>
                  {item.description && (
                    <TooltipContent>
                      <p>{item.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedItems).length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            {searchQuery ? 'No nodes found' : 'No nodes available'}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { FileIcon, FolderIcon, FolderOpenIcon } from 'lucide-react';
import { cn } from '@forge/ui/lib/utils';
import type { TreeInstance } from '@headless-tree/core';
import type { ItemInstance } from '@headless-tree/core';

const TREE_INDENT = 20;

export interface TreeProps<T> {
  tree: TreeInstance<T>;
  indent?: number;
  className?: string;
  children: React.ReactNode;
}

export function Tree<T>({
  tree,
  indent = TREE_INDENT,
  className,
  children,
}: TreeProps<T>) {
  return (
    <div
      className={cn('relative', className)}
      style={{ '--tree-indent': `${indent}px` } as React.CSSProperties}
      {...tree.getContainerProps()}
    >
      {children}
    </div>
  );
}

export interface TreeItemProps<T> {
  item: ItemInstance<T>;
  children: React.ReactNode;
}

export function TreeItem<T>({ item, children }: TreeItemProps<T>) {
  const meta = item.getItemMeta();
  const depth = meta.level ?? 0;
  return (
    <div
      className="relative"
      style={{ paddingLeft: `${depth * TREE_INDENT}px` }}
    >
      {children}
    </div>
  );
}

export interface TreeItemLabelProps<T> {
  item: ItemInstance<T>;
  className?: string;
  onLeafClick?: (docId: string) => void;
}

export function TreeItemLabel<T extends { docId?: string }>({
  item,
  className,
  onLeafClick,
}: TreeItemLabelProps<T>) {
  const data = item.getItemData();
  const isFolder = item.isFolder();
  const isLeaf = data?.docId !== undefined;

  const props = item.getProps();
  const handleClick = (e: React.MouseEvent) => {
    (props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
    if (isLeaf && data?.docId && onLeafClick) {
      onLeafClick(data.docId);
    }
  };

  return (
    <div
      className={cn(
        'relative flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent before:-z-10 before:absolute before:inset-x-0 before:inset-y-0.5 before:bg-background',
        className,
      )}
      {...props}
      onClick={handleClick}
    >
      {isFolder ? (
        item.isExpanded() ? (
          <FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <FolderIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )
      ) : (
        <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className="min-w-0 truncate">{item.getItemName()}</span>
    </div>
  );
}

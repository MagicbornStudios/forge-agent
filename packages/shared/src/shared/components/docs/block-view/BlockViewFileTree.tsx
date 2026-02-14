'use client';

import * as React from 'react';
import { FileText, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@forge/ui/lib/utils';
import { ScrollArea } from '@forge/ui/scroll-area';
import type { BlockViewFile } from './types';

interface TreeNode {
  name: string;
  path: string;
  kind: 'file' | 'folder';
  children?: TreeNode[];
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'folder' ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}

function createTree(files: BlockViewFile[]): TreeNode[] {
  const root: TreeNode = {
    name: 'root',
    path: '',
    kind: 'folder',
    children: [],
  };

  for (const file of files) {
    const segments = file.path.split('/').filter(Boolean);
    let cursor = root;

    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1;
      const nextPath = cursor.path ? `${cursor.path}/${segment}` : segment;
      const children = cursor.children ?? [];
      let nextNode = children.find((candidate) => candidate.path === nextPath);

      if (!nextNode) {
        nextNode = {
          name: segment,
          path: nextPath,
          kind: isLeaf ? 'file' : 'folder',
          children: isLeaf ? undefined : [],
        };
        children.push(nextNode);
        cursor.children = children;
      }

      cursor = nextNode;
    });
  }

  const walk = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (node.children) {
        walk(node.children);
        node.children = sortNodes(node.children);
      }
    }
  };
  walk(root.children ?? []);

  return sortNodes(root.children ?? []);
}

function NodeRow({
  node,
  depth,
  activePath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  activePath: string;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const hasChildren = Boolean(node.children?.length);

  if (node.kind === 'file') {
    return (
      <li className="list-none">
        <button
          type="button"
          onClick={() => onSelect(node.path)}
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs outline-none transition-colors',
            activePath === node.path
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
          style={{ paddingLeft: depth === 0 ? 0 : `${depth}px` }}
          data-slot="block-view-file"
          data-active={activePath === node.path ? 'true' : 'false'}
        >
          <FileText className="size-3.5 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
      </li>
    );
  }

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs font-medium text-foreground/90 outline-none transition-colors hover:bg-muted/60"
        style={{ paddingLeft: depth === 0 ? 0 : `${depth}px` }}
        data-slot="block-view-folder"
        data-open={open ? 'true' : 'false'}
      >
        {open ? <FolderOpen className="size-3.5 shrink-0" /> : <Folder className="size-3.5 shrink-0" />}
        <span className="truncate">{node.name}</span>
      </button>
      {open && hasChildren ? (
        <ul className="m-0 list-none space-y-0.5 pl-0">
          {node.children?.map((child) => (
            <NodeRow key={child.path} node={child} depth={depth + 1} activePath={activePath} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function BlockViewFileTree({
  files,
  activePath,
  onSelect,
  className,
}: {
  files: BlockViewFile[];
  activePath: string;
  onSelect: (path: string) => void;
  className?: string;
}) {
  const tree = React.useMemo(() => createTree(files), [files]);
  const isSingleFile = files.length === 1;

  return (
    <div className={cn('w-72 shrink-0 border-r bg-card/30', className)} data-slot="block-view-file-tree">
      <div className="h-10 border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Files
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <ul className="m-0 list-none space-y-0.5 p-2">
          {isSingleFile ? (
            <li className="list-none">
              <button
                type="button"
                onClick={() => onSelect(files[0].path)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-xs outline-none transition-colors',
                  activePath === files[0].path
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
                data-slot="block-view-file"
                data-active={activePath === files[0].path ? 'true' : 'false'}
              >
                <FileText className="size-3.5 shrink-0" />
                <span className="truncate">{files[0].path.split('/').pop() ?? files[0].path}</span>
              </button>
            </li>
          ) : (
            tree.map((node) => (
              <NodeRow key={node.path} node={node} depth={0} activePath={activePath} onSelect={onSelect} />
            ))
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}


'use client';

import * as React from 'react';
import Link from 'next/link';
import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { deserializePageTree } from 'fumadocs-core/source/client';
import type { Folder, Item, Node, Root } from 'fumadocs-core/page-tree';
import { BookOpenText, ChevronRight, File, FileCode2, FolderClosed, FolderOpen, Search } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { toPlainText, toTitleFromHref } from './tree-label';

function isItem(node: Node): node is Item {
  return node.type === 'page';
}

function isFolder(node: Node): node is Folder {
  return node.type === 'folder';
}

function getNodeLabel(node: Item | Folder): string {
  const fallback = isItem(node) ? toTitleFromHref(node.url, 'Doc') : 'Section';
  return toPlainText(node.name, fallback);
}

function resolveFolderUrl(folder: Folder): string | null {
  if (folder.index?.url) return folder.index.url;
  for (const child of folder.children) {
    if (isItem(child)) return child.url;
    if (isFolder(child)) {
      const nested = resolveFolderUrl(child);
      if (nested) return nested;
    }
  }
  return null;
}

function getItemIcon(url: string) {
  const normalized = url.toLowerCase();
  if (normalized.includes('/api') || normalized.includes('reference')) return FileCode2;
  return File;
}

function shouldRenderNode(node: Node, query: string): boolean {
  if (!query) return true;
  if (node.type === 'separator') return false;
  if (isItem(node)) {
    return getNodeLabel(node).toLowerCase().includes(query);
  }
  if (isFolder(node)) {
    if (getNodeLabel(node).toLowerCase().includes(query)) return true;
    return node.children.some((child) => shouldRenderNode(child, query));
  }
  return false;
}

function NavNodes({
  nodes,
  query,
  pathname,
  depth = 0,
  openMap,
  onToggleFolder,
}: {
  nodes: Node[];
  query: string;
  pathname: string;
  depth?: number;
  openMap: Record<string, boolean>;
  onToggleFolder: (key: string, next: boolean) => void;
}) {
  return (
    <>
      {nodes.map((node, index) => {
        if (!shouldRenderNode(node, query) || node.type === 'separator') return null;

        if (isItem(node)) {
          const label = getNodeLabel(node);
          const ItemIcon = getItemIcon(node.url);
          const active = pathname === node.url || (node.url !== '/docs' && pathname.startsWith(`${node.url}/`));
          return (
            <SidebarMenuItem key={node.$id ?? `${node.url}-${index}`}>
              <SidebarMenuButton
                asChild
                isActive={active}
                className={cn('h-8 text-[13px]', depth > 0 && 'pl-2')}
                style={{ marginLeft: depth > 0 ? `${Math.min(42, depth * 12)}px` : undefined }}
              >
                <Link href={node.url} className="min-w-0">
                  <ItemIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate" title={label}>
                    {label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        if (isFolder(node)) {
          const folderKey = node.$id ?? `folder-${index}-${getNodeLabel(node)}`;
          const isOpen = query.length > 0 ? true : (openMap[folderKey] ?? true);
          const label = getNodeLabel(node);
          const FolderIcon = isOpen ? FolderOpen : FolderClosed;
          const url = resolveFolderUrl(node) ?? '#';
          return (
            <SidebarGroup key={folderKey} className="px-0 py-0.5">
              <Collapsible open={isOpen} onOpenChange={(next) => onToggleFolder(folderKey, next)}>
                <SidebarMenuItem>
                  <div
                    className="flex items-center gap-1"
                    style={{ marginLeft: depth > 0 ? `${Math.min(42, depth * 12)}px` : undefined }}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        aria-label={`Toggle ${label}`}
                      >
                        <ChevronRight className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')} />
                      </button>
                    </CollapsibleTrigger>
                    <SidebarMenuButton asChild className="h-8 min-w-0 text-[13px]">
                      <Link href={url} className="min-w-0">
                        <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate" title={label}>
                          {label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </div>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarGroupContent className="ml-4 border-l border-border/70 pl-2">
                    <SidebarMenu className="gap-0.5">
                      <NavNodes
                        nodes={node.children}
                        query={query}
                        pathname={pathname}
                        depth={depth + 1}
                        openMap={openMap}
                        onToggleFolder={onToggleFolder}
                      />
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        }

        return null;
      })}
    </>
  );
}

export function DocsSidebar({
  serializedTree,
  pathname,
  baseUrl = '/docs',
}: {
  serializedTree: SerializedPageTree;
  pathname: string;
  baseUrl?: string;
}) {
  const tree = deserializePageTree(serializedTree) as Root;
  const [query, setQuery] = React.useState('');
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});
  const normalizedQuery = query.trim().toLowerCase();

  const onToggleFolder = React.useCallback((key: string, next: boolean) => {
    setOpenMap((prev) => ({ ...prev, [key]: next }));
  }, []);

  return (
    <Sidebar
      id="platform-docs-sidebar"
      collapsible="none"
      className="platform-docs-sidebar border-r border-border/70 md:top-[var(--docs-header-height)] md:bottom-auto md:h-[calc(100svh-var(--docs-header-height))]"
    >
      <SidebarHeader className="border-b border-border/70">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9 rounded-md">
              <Link href={baseUrl}>
                <BookOpenText className="size-4 text-primary" />
                <span className="font-semibold">Docs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="relative px-2 pt-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documentation..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-1 py-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-1.5">
              <NavNodes
                nodes={tree.children}
                query={normalizedQuery}
                pathname={pathname}
                openMap={openMap}
                onToggleFolder={onToggleFolder}
              />
              {normalizedQuery.length > 0 && !tree.children.some((node) => shouldRenderNode(node, normalizedQuery)) ? (
                <p className="px-2 py-2 text-xs text-muted-foreground">
                  No results for &quot;{query}&quot;
                </p>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@forge/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@forge/ui/collapsible';
import { Input } from '@forge/ui/input';
import { cn } from '@forge/ui/lib/utils';
import { deserializePageTree } from 'fumadocs-core/source/client';
import type { Root, Node, Item, Folder } from 'fumadocs-core/page-tree';
import type { SerializedPageTree } from 'fumadocs-core/source/client';
import {
  BookMarked,
  ChevronRight,
  File,
  FileCode2,
  Folder,
  FolderOpen,
  Search,
} from 'lucide-react';
import { resolveFolderUrl, resolveNodeLabel } from './sidebar-label';
import { toPlainText, toTitleFromHref } from './tree-label';

function isItem(node: Node): node is Item {
  return node.type === 'page';
}

function isFolder(node: Node): node is Folder {
  return node.type === 'folder';
}

function getNodeKey(node: Node, fallback: string) {
  if (node.$id) return node.$id;
  return fallback;
}

function matchesLabel(label: React.ReactNode, query: string, fallbackHref = '') {
  return toPlainText(label, toTitleFromHref(fallbackHref, '')).toLowerCase().includes(query);
}

function shouldRenderNode(node: Node, query: string): boolean {
  if (!query) return true;
  if (node.type === 'separator') return false;
  if (isItem(node)) return matchesLabel(node.name, query, node.url);
  if (isFolder(node)) {
    if (matchesLabel(node.name, query, resolveFolderUrl(node) ?? '')) return true;
    return node.children.some((child) => shouldRenderNode(child, query));
  }
  return false;
}

interface NavNodesProps {
  nodes: Node[];
  query: string;
  depth?: number;
  openMap: Record<string, boolean>;
  onToggleFolder: (key: string, next: boolean) => void;
}

function getItemIcon(url: string) {
  const normalized = url.toLowerCase();
  if (normalized.includes('/api') || normalized.includes('reference')) return FileCode2;
  return File;
}

function NavNodes({ nodes, query, depth = 0, openMap, onToggleFolder }: NavNodesProps) {
  const pathname = usePathname();
  return (
    <>
      {nodes.map((node, index) => {
        if (!shouldRenderNode(node, query)) return null;
        if (node.type === 'separator') return null;
        if (isItem(node)) {
          const active = pathname === node.url || (node.url !== '/docs' && pathname.startsWith(node.url + '/'));
          const label = resolveNodeLabel(node);
          const ItemIcon = getItemIcon(node.url);
          const nestedIndent = depth > 0 ? `${Math.min(42, depth * 12)}px` : '0px';
          return (
            <SidebarMenuItem
              key={getNodeKey(node, node.url)}
              className={cn(depth > 0 && 'relative', depth > 0 && 'pl-1.5')}
            >
              <SidebarMenuButton
                asChild
                isActive={active}
                className={cn(
                  'h-8 gap-2 rounded-md px-2.5 text-[13px]',
                  active && 'bg-sidebar-accent/70 text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--primary)]',
                )}
                style={{ marginLeft: nestedIndent }}
              >
                <Link href={node.url} className="min-w-0">
                  {depth > 0 ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-2 top-1/2 h-px w-2 -translate-y-1/2 bg-sidebar-border/90"
                    />
                  ) : null}
                  <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <ItemIcon className="size-3.5 shrink-0 text-muted-foreground/90" />
                    <span className="truncate" title={label}>
                      {label}
                    </span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }
        if (isFolder(node)) {
          const label = resolveNodeLabel(node);
          const folderKey = getNodeKey(node, `folder-${label}-${index}`);
          const isOpen = query.length > 0 ? true : (openMap[folderKey] ?? true);
          const FolderIcon = isOpen ? FolderOpen : Folder;
          return (
            <SidebarGroup key={folderKey} className="px-0 py-0.5">
              <Collapsible open={isOpen} onOpenChange={(next) => onToggleFolder(folderKey, next)}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-8 w-full min-w-0 items-center rounded-md px-2.5 text-left text-[13px] font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                    style={{ marginLeft: depth > 0 ? `${Math.min(42, depth * 12)}px` : undefined }}
                  >
                    <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                      <ChevronRight
                        className={cn(
                          'size-3.5 shrink-0 text-muted-foreground transition-transform',
                          isOpen && 'rotate-90',
                        )}
                      />
                      <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate" title={label}>
                        {label}
                      </span>
                    </span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="ml-3 border-l border-sidebar-border/80 pl-2.5">
                    <SidebarMenu className="gap-0.5">
                      <NavNodes
                        nodes={node.children}
                        query={query}
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

export interface DocsSidebarProps {
  serializedTree: SerializedPageTree;
  baseUrl?: string;
}

export function DocsSidebar({ serializedTree, baseUrl = '/docs' }: DocsSidebarProps) {
  const tree = deserializePageTree(serializedTree) as Root;
  const [query, setQuery] = React.useState('');
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});
  const normalizedQuery = query.trim().toLowerCase();

  const onToggleFolder = React.useCallback((key: string, next: boolean) => {
    setOpenMap((prev) => ({ ...prev, [key]: next }));
  }, []);

  return (
    <Sidebar
      id="nd-sidebar"
      collapsible="none"
      className="forge-docs-sidebar border-r border-sidebar-border/80 md:bottom-auto md:top-[var(--docs-header-height)] md:h-[calc(100svh-var(--docs-header-height))]"
    >
      <SidebarHeader className="border-b border-sidebar-border/80 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-10 rounded-md">
              <Link href={baseUrl}>
                <BookMarked className="size-4 text-primary" />
                <span className="font-semibold tracking-wide">Docs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-2 text-xs text-muted-foreground">
          Guides, architecture, design, and API references.
        </p>
        <div className="relative px-2 pt-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documentation..."
            className="h-9 border-sidebar-border bg-sidebar pl-9 pr-2 text-xs"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0 py-1">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-1.5">
              <NavNodes
                nodes={tree.children}
                query={normalizedQuery}
                openMap={openMap}
                onToggleFolder={onToggleFolder}
              />
              {normalizedQuery.length > 0 && !tree.children.some((node) => shouldRenderNode(node, normalizedQuery)) ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">No results for "{query}"</p>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

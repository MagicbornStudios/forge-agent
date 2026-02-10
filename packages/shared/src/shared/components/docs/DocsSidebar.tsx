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
  Bot,
  ChevronDown,
  Compass,
  FileCode2,
  FileText,
  FolderOpen,
  LayoutPanelTop,
  Palette,
  Route,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';

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

function labelText(value: React.ReactNode, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function matchesLabel(label: React.ReactNode, query: string) {
  return labelText(label).toLowerCase().includes(query);
}

function shouldRenderNode(node: Node, query: string): boolean {
  if (!query) return true;
  if (node.type === 'separator') return false;
  if (isItem(node)) return matchesLabel(node.name, query);
  if (isFolder(node)) {
    if (matchesLabel(node.name, query)) return true;
    return node.children.some((child) => shouldRenderNode(child, query));
  }
  return false;
}

function iconForLabel(label: string, folder = false) {
  const normalized = label.toLowerCase();
  if (normalized.includes('how-to') || normalized.includes('guide')) return Wrench;
  if (normalized.includes('design')) return Palette;
  if (normalized.includes('architecture')) return LayoutPanelTop;
  if (normalized.includes('roadmap')) return Route;
  if (normalized.includes('api')) return FileCode2;
  if (normalized.includes('ai')) return Bot;
  if (normalized.includes('agent')) return Sparkles;
  if (normalized.includes('product') || normalized.includes('business')) return Compass;
  if (normalized.includes('start') || normalized.includes('index')) return BookMarked;
  return folder ? FolderOpen : FileText;
}

interface NavNodesProps {
  nodes: Node[];
  query: string;
  depth?: number;
  openMap: Record<string, boolean>;
  onToggleFolder: (key: string, next: boolean) => void;
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
          const ItemIcon = iconForLabel(labelText(node.name, 'Doc'));
          return (
            <SidebarMenuItem key={getNodeKey(node, node.url)}>
              <SidebarMenuButton
                asChild
                isActive={active}
                className={cn('h-8 gap-2 rounded-md text-sm', active && 'shadow-[inset_2px_0_0_var(--primary)]')}
                style={{ paddingLeft: `${Math.max(8, 8 + depth * 12)}px` }}
              >
                <Link href={node.url}>
                  <ItemIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{node.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }
        if (isFolder(node)) {
          const label = labelText(node.name, 'Section');
          const folderKey = getNodeKey(node, `folder-${label}-${index}`);
          const isOpen = query.length > 0 ? true : (openMap[folderKey] ?? true);
          const FolderIcon = iconForLabel(label, true);
          return (
            <SidebarGroup key={folderKey} className="py-0.5">
              <Collapsible open={isOpen} onOpenChange={(next) => onToggleFolder(folderKey, next)}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FolderIcon className="size-3.5" />
                      <span className="truncate">{label}</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-3 transition-transform',
                        !isOpen && '-rotate-90',
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="ml-3 border-l border-sidebar-border/70 pl-1">
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
    <Sidebar collapsible="none" className="border-r border-sidebar-border/70">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-10">
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
        <div className="relative px-2 pb-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documentation..."
            className="h-8 border-sidebar-border bg-sidebar pl-8 text-xs"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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

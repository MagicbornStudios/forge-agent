'use client';

import * as React from 'react';
import Link from 'next/link';
import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { deserializePageTree } from 'fumadocs-core/source/client';
import type { Folder, Item, Node, Root, Separator } from 'fumadocs-core/page-tree';
import {
  BookOpenText,
  ChevronRight,
  File,
  FileCode2,
  FolderClosed,
  FolderOpen,
  Search,
  icons,
} from 'lucide-react';
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
import {
  isSlugVisibleForAudience,
  shouldShowSeparator,
  type DocsAudience,
  getRootSlug,
  withAudienceQuery,
} from '@/lib/docs/audience';
import { getFallbackIconNameForSlug } from '@/lib/docs/icons';
import { toPlainText, toTitleFromHref } from './tree-label';

function isItem(node: Node): node is Item {
  return node.type === 'page';
}

function isFolder(node: Node): node is Folder {
  return node.type === 'folder';
}

function isSeparator(node: Node): node is Separator {
  return node.type === 'separator';
}

function getNodeLabel(node: Item | Folder): string {
  const fallback = isItem(node) ? toTitleFromHref(node.url, 'Doc') : 'Section';
  const rawLabel = toPlainText(node.name, fallback);
  return stripDuplicatedLeadingIconLabel(rawLabel, node);
}

function getSeparatorLabel(node: Separator): string {
  return toPlainText(node.name, 'Section');
}

function getDepthIndent(depth: number): number {
  if (depth <= 0) return 0;
  return Math.min(36, depth * 12);
}

function stripDuplicatedLeadingIconLabel(label: string, node: Item | Folder): string {
  if (!('icon' in node) || typeof node.icon !== 'string') return label;

  const iconToken = node.icon
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim();

  if (!iconToken) return label;

  const compactLabel = label.replace(/\s+/g, '').toLowerCase();
  const compactIcon = iconToken.replace(/\s+/g, '').toLowerCase();
  const hasDuplicatedPrefix = compactLabel.startsWith(`${compactIcon}${compactIcon}`);

  if (!hasDuplicatedPrefix) return label;

  const normalized = label.trim();
  if (normalized.toLowerCase().startsWith(iconToken.toLowerCase())) {
    return normalized.slice(iconToken.length).trimStart();
  }

  return label;
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

function getFallbackIcon(rootSlug: string, audience: DocsAudience) {
  const iconName = getFallbackIconNameForSlug(rootSlug, audience);
  const Icon = icons[iconName as keyof typeof icons] ?? File;
  return <Icon className="size-3.5 shrink-0 text-muted-foreground" />;
}

function renderNamedIcon(name: string): React.ReactNode | null {
  const normalized = name.trim();
  if (!normalized) return null;

  const directIcon = icons[normalized as keyof typeof icons];
  if (directIcon) {
    const Icon = directIcon;
    return <Icon className="size-3.5 shrink-0 text-muted-foreground" />;
  }

  const compact = normalized.replace(/[^a-zA-Z0-9]/g, '');
  if (!compact) return null;

  const pascalCase = compact.charAt(0).toUpperCase() + compact.slice(1);
  const compactIcon = icons[pascalCase as keyof typeof icons];
  if (compactIcon) {
    const Icon = compactIcon;
    return <Icon className="size-3.5 shrink-0 text-muted-foreground" />;
  }

  return null;
}

function renderNodeIcon(node: Node, audience: DocsAudience): React.ReactNode {
  if ('icon' in node && node.icon) {
    if (typeof node.icon === 'string') {
      const declaredIcon = renderNamedIcon(node.icon);
      if (declaredIcon) return declaredIcon;
    }

    if (React.isValidElement(node.icon)) {
      const inlineText = toPlainText(node.icon, '').trim();
      if (inlineText.length > 0) {
        const declaredIcon = renderNamedIcon(inlineText);
        if (declaredIcon) return declaredIcon;
        return null;
      }

      const nodeProps = (node.icon.props ?? {}) as { className?: string };
      return React.cloneElement(
        node.icon as React.ReactElement<{ className?: string }>,
        {
          className: cn('size-3.5 shrink-0 text-muted-foreground', nodeProps.className),
        },
      );
    }
  }

  if (isItem(node)) {
    const rootSlug = getRootSlug(node.url);
    if (rootSlug === 'reference' || rootSlug === 'api-reference') {
      return <FileCode2 className="size-3.5 shrink-0 text-muted-foreground" />;
    }
    return getFallbackIcon(rootSlug, audience);
  }

  if (isFolder(node)) {
    const rootSlug = getRootSlug(resolveFolderUrl(node) ?? '');
    return getFallbackIcon(rootSlug, audience);
  }

  return <File className="size-3.5 shrink-0 text-muted-foreground" />;
}

function shouldRenderNode(node: Node, query: string): boolean {
  if (!query) return true;
  if (isSeparator(node)) return false;

  if (isItem(node)) {
    return getNodeLabel(node).toLowerCase().includes(query);
  }

  if (isFolder(node)) {
    if (getNodeLabel(node).toLowerCase().includes(query)) return true;
    return node.children.some((child) => shouldRenderNode(child, query));
  }

  return false;
}

function compactSeparators(nodes: Node[]): Node[] {
  const next: Node[] = [];

  for (const node of nodes) {
    if (isSeparator(node)) {
      if (next.length === 0) continue;
      if (isSeparator(next[next.length - 1] as Node)) continue;
    }

    next.push(node);
  }

  while (next.length > 0 && isSeparator(next[next.length - 1] as Node)) {
    next.pop();
  }

  return next;
}

function filterNodesForAudience(nodes: Node[], audience: DocsAudience, baseUrl: string): Node[] {
  const filtered: Node[] = [];

  for (const node of nodes) {
    if (isSeparator(node)) {
      if (shouldShowSeparator(audience)) filtered.push(node);
      continue;
    }

    if (isItem(node)) {
      if (isSlugVisibleForAudience(node.url, audience, baseUrl)) filtered.push(node);
      continue;
    }

    if (isFolder(node)) {
      const includeIndex = node.index ? isSlugVisibleForAudience(node.index.url, audience, baseUrl) : false;
      const children = filterNodesForAudience(node.children, audience, baseUrl);
      if (!includeIndex && children.length === 0) continue;

      filtered.push({
        ...node,
        index: includeIndex ? node.index : undefined,
        children,
      });
    }
  }

  return compactSeparators(filtered);
}

function NavNodes({
  nodes,
  query,
  pathname,
  audience,
  depth = 0,
  openMap,
  onToggleFolder,
}: {
  nodes: Node[];
  query: string;
  pathname: string;
  audience: DocsAudience;
  depth?: number;
  openMap: Record<string, boolean>;
  onToggleFolder: (key: string, next: boolean) => void;
}) {
  return (
    <>
      {nodes.map((node, index) => {
        if (!shouldRenderNode(node, query)) return null;

        if (isSeparator(node)) {
          const label = getSeparatorLabel(node);
          const indent = getDepthIndent(depth);
          return (
            <div
              key={node.$id ?? `separator-${index}`}
              className="px-2 pt-3 pb-1 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground/80 uppercase"
              style={{ paddingLeft: indent > 0 ? `${indent + 8}px` : undefined }}
            >
              {label}
            </div>
          );
        }

        if (isItem(node)) {
          const label = getNodeLabel(node);
          const href = withAudienceQuery(node.url, audience);
          const active = pathname === node.url || (node.url !== '/docs' && pathname.startsWith(`${node.url}/`));
          const indent = getDepthIndent(depth);
          return (
            <SidebarMenuItem key={node.$id ?? `${node.url}-${index}`} className="min-w-0">
              <SidebarMenuButton
                asChild
                isActive={active}
                className="h-8 min-w-0 text-[13px]"
                style={{ paddingLeft: indent > 0 ? `${indent + 8}px` : undefined }}
              >
                <Link href={href} className="flex min-w-0 items-center gap-2">
                  {renderNodeIcon(node, audience)}
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
          const url = resolveFolderUrl(node);
          const indent = getDepthIndent(depth);
          return (
            <SidebarGroup key={folderKey} className="min-w-0 px-0 py-0.5">
              <Collapsible open={isOpen} onOpenChange={(next) => onToggleFolder(folderKey, next)}>
                <SidebarMenuItem className="min-w-0">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-8 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-left text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                      style={{ paddingLeft: indent > 0 ? `${indent + 8}px` : undefined }}
                      aria-label={`Toggle ${label}`}
                    >
                      <ChevronRight
                        className={cn(
                          'size-3.5 shrink-0 text-muted-foreground transition-transform',
                          isOpen && 'rotate-90',
                        )}
                      />
                      {url ? (
                        <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        renderNodeIcon(node, audience)
                      )}
                      <span className="min-w-0 flex-1 truncate" title={label}>
                        {label}
                      </span>
                    </button>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarGroupContent className="min-w-0 pl-4">
                    <SidebarMenu className="min-w-0 gap-0.5 overflow-x-hidden border-l border-border/70 pl-2">
                      <NavNodes
                        nodes={node.children}
                        query={query}
                        pathname={pathname}
                        audience={audience}
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
  pathname: string;
  baseUrl?: string;
  audience: DocsAudience;
}

export function DocsSidebar({
  serializedTree,
  pathname,
  baseUrl = '/docs',
  audience,
}: DocsSidebarProps) {
  const tree = React.useMemo(() => deserializePageTree(serializedTree) as Root, [serializedTree]);
  const [query, setQuery] = React.useState('');
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});
  const normalizedQuery = query.trim().toLowerCase();

  const audienceNodes = React.useMemo(
    () => filterNodesForAudience(tree.children, audience, baseUrl),
    [audience, baseUrl, tree.children],
  );

  const onToggleFolder = React.useCallback((key: string, next: boolean) => {
    setOpenMap((prev) => ({ ...prev, [key]: next }));
  }, []);

  return (
    <Sidebar
      id="platform-docs-sidebar"
      collapsible="none"
      className="platform-docs-sidebar overflow-hidden border-r border-border/70 md:top-[var(--docs-header-height)] md:bottom-auto md:h-[calc(100svh-var(--docs-header-height))]"
    >
      <SidebarHeader className="border-b border-border/70">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-9 rounded-md">
              <Link href={withAudienceQuery(baseUrl, audience)}>
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
      <SidebarContent className="overflow-x-hidden overflow-y-auto">
        <SidebarGroup className="min-w-0 px-1 py-1">
          <SidebarGroupContent>
            <SidebarMenu className="min-w-0 gap-0.5 px-1.5 overflow-x-hidden">
              <NavNodes
                nodes={audienceNodes}
                query={normalizedQuery}
                pathname={pathname}
                audience={audience}
                openMap={openMap}
                onToggleFolder={onToggleFolder}
              />
              {normalizedQuery.length > 0 && !audienceNodes.some((node) => shouldRenderNode(node, normalizedQuery)) ? (
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

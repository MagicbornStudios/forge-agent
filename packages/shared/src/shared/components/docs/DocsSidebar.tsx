'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@forge/ui/sidebar';
import { deserializePageTree } from 'fumadocs-core/source/client';
import type { Root, Node, Item, Folder } from 'fumadocs-core/page-tree';
import type { SerializedPageTree } from 'fumadocs-core/source/client';

function isItem(node: Node): node is Item {
  return node.type === 'page';
}

function isFolder(node: Node): node is Folder {
  return node.type === 'folder';
}

function NavNodes({ nodes }: { nodes: Node[] }) {
  const pathname = usePathname();
  return (
    <>
      {nodes.map((node) => {
        if (node.type === 'separator') return null;
        if (isItem(node)) {
          const active = pathname === node.url || (node.url !== '/docs' && pathname.startsWith(node.url + '/'));
          return (
            <SidebarMenuItem key={node.url}>
              <SidebarMenuButton asChild isActive={active}>
                <Link href={node.url}>{node.name}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }
        if (isFolder(node)) {
          const label = typeof node.name === 'string' ? node.name : 'Section';
          return (
            <SidebarGroup key={label}>
              <SidebarGroupLabel>{label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NavNodes nodes={node.children} />
                </SidebarMenu>
              </SidebarGroupContent>
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
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={baseUrl}>Documentation</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavNodes nodes={tree.children} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

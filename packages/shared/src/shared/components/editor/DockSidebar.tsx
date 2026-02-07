'use client';

import * as React from 'react';
import {
  WorkspaceSidebar,
  type WorkspaceSidebarProps,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '../workspace/panels';

export type DockSidebarProps = WorkspaceSidebarProps;

/**
 * DockSidebar — grid-embedded shadcn Sidebar wrapper for DockLayout panels.
 *
 * This is a naming-aligned alias of WorkspaceSidebar. Use within DockPanel
 * regions when you want the shadcn Sidebar experience inside the editor.
 */
export function DockSidebar(props: DockSidebarProps) {
  return <WorkspaceSidebar {...props} />;
}

// Re-export shadcn sidebar primitives for convenience.
export {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
};

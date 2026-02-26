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
} from './WorkspaceSidebar';

export type DockSidebarProps = WorkspaceSidebarProps;

/**
 * DockSidebar — grid-embedded shadcn Sidebar wrapper for DockLayout panels.
 * Alias of WorkspaceSidebar for use within DockPanel regions.
 */
export function DockSidebar(props: DockSidebarProps) {
  return <WorkspaceSidebar {...props} />;
}

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

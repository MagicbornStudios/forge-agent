'use client';

import * as React from 'react';
import {
  EditorSidebar,
  type EditorSidebarProps,
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
} from './EditorSidebar';

export type DockSidebarProps = EditorSidebarProps;

/**
 * DockSidebar — grid-embedded shadcn Sidebar wrapper for DockLayout panels.
 * Alias of EditorSidebar for use within DockPanel regions.
 */
export function DockSidebar(props: DockSidebarProps) {
  return <EditorSidebar {...props} />;
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

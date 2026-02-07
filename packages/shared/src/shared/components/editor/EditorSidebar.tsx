'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import {
  SidebarProvider,
  Sidebar,
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
} from '@forge/ui/sidebar';

// Re-export shadcn sidebar primitives for consumers
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

export interface EditorSidebarProps {
  children?: React.ReactNode;
  side?: 'left' | 'right';
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  width?: string;
  className?: string;
}

/**
 * EditorSidebar composes shadcn Sidebar for use inside a dock/panel.
 * Overrides default fixed positioning to relative + h-full for grid-embedded use.
 */
export function EditorSidebar({
  children,
  side = 'left',
  collapsible = false,
  defaultOpen = true,
  open,
  onOpenChange,
  width = '280px',
  className,
}: EditorSidebarProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn('h-full w-full !min-h-0', className)}
      style={
        {
          '--sidebar-width': width,
          '--sidebar-width-mobile': '18rem',
        } as React.CSSProperties
      }
    >
      <Sidebar
        side={side}
        variant="sidebar"
        collapsible={collapsible ? 'offcanvas' : 'none'}
        className={cn('!relative !inset-auto !z-auto !h-full', '[&]:h-full')}
      >
        {children}
      </Sidebar>
    </SidebarProvider>
  );
}

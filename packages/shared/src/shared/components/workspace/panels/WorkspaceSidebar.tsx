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

// ---------------------------------------------------------------------------
// Re-export shadcn sidebar primitives for consumers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// WorkspaceSidebar — grid-embedded wrapper around shadcn Sidebar
// ---------------------------------------------------------------------------

export interface WorkspaceSidebarProps {
  children?: React.ReactNode;
  /** Which side the sidebar sits on. Affects border placement. */
  side?: 'left' | 'right';
  /** Enable collapse toggle. Default: false for workspace panels. */
  collapsible?: boolean;
  /** Whether the sidebar starts open. Default: true. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Override sidebar width CSS variable. Default: '280px'. */
  width?: string;
  className?: string;
}

/**
 * WorkspaceSidebar composes shadcn Sidebar primitives for use inside a
 * `WorkspaceLayoutGrid` cell. It overrides the default fixed/full-viewport
 * positioning to relative + h-full so the sidebar lives within the grid.
 *
 * Children should be shadcn sidebar primitives: `<SidebarHeader>`,
 * `<SidebarContent>`, `<SidebarFooter>`, etc.
 */
export function WorkspaceSidebar({
  children,
  side = 'left',
  collapsible = false,
  defaultOpen = true,
  open,
  onOpenChange,
  width = '280px',
  className,
}: WorkspaceSidebarProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        // Override shadcn's `min-h-svh` to work inside a grid cell
        'h-full w-full !min-h-0',
        className,
      )}
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
        className={cn(
          // Override shadcn's fixed positioning for grid-embedded use
          '!relative !inset-auto !z-auto !h-full',
          // Override h-svh with h-full
          '[&]:h-full',
        )}
      >
        {children}
      </Sidebar>
    </SidebarProvider>
  );
}

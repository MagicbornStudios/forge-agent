'use client';

import {
  DockSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function DockSidebarDemo() {
  return (
    <ShowcaseDemoSurface className="h-[280px] p-0">
      <div className="h-full rounded-md border border-border/70">
        <DockSidebar>
          <SidebarHeader>
            <span className="text-xs font-semibold">Dock Sidebar</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Graphs</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Nodes</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </DockSidebar>
      </div>
    </ShowcaseDemoSurface>
  );
}

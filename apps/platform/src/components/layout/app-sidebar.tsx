'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth/AuthProvider';
import { navItems } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFilteredNavItems } from '@/hooks/use-nav';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from './org-switcher';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const itemsToShow = useFilteredNavItems(navItems);
  const { activeOrganization } = useAuth();

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  const isPathActive = React.useCallback(
    (url: string) => {
      if (pathname === url) return true;
      if (url === '/') return false;
      return pathname.startsWith(`${url}/`);
    },
    [pathname]
  );

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b border-sidebar-border/60 px-2 py-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              tooltip='Dashboard home'
              isActive={isPathActive(PLATFORM_ROUTES.dashboardOverview)}
            >
              <Link href={PLATFORM_ROUTES.dashboardOverview}>
                <Icons.logo />
                <span className='min-w-0 truncate font-semibold'>Forge Platform</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {itemsToShow.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              const hasChildren = Boolean(item.items && item.items.length > 0);
              const hasActiveChild =
                hasChildren && item.items ? item.items.some((subItem) => isPathActive(subItem.url)) : false;
              const isParentActive = isPathActive(item.url) || hasActiveChild;
              return hasChildren ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isParentActive || item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isParentActive}>
                      <Link href={item.url}>
                        {item.icon && <Icon />}
                        <span className='min-w-0 truncate'>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction
                        showOnHover
                        aria-label={`Toggle ${item.title} section`}
                      >
                        <IconChevronRight className='transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isPathActive(subItem.url)}
                            >
                              <Link href={subItem.url}>
                                <span className='min-w-0 truncate'>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isPathActive(item.url)}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span className='min-w-0 truncate'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className='px-2 py-1 text-xs text-muted-foreground'>
          {activeOrganization ? `Role: ${activeOrganization.role}` : 'No organization selected'}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

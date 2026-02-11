'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function OrgSwitcher() {
  const { memberships, activeOrganizationId, switchOrganization } = useAuth();
  const [pendingOrgId, setPendingOrgId] = useState<number | null>(null);

  if (memberships.length === 0) {
    return null;
  }

  const activeOrganization =
    memberships.find((entry) => entry.organizationId === activeOrganizationId) ??
    memberships[0];

  async function handleSwitch(nextOrgId: number) {
    if (nextOrgId === activeOrganization.organizationId) return;
    setPendingOrgId(nextOrgId);
    try {
      await switchOrganization(nextOrgId);
    } finally {
      setPendingOrgId(null);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="justify-between">
              <span className="flex min-w-0 items-center gap-2">
                <Building2 className="size-4 shrink-0" />
                <span className="truncate">{activeOrganization.organizationName}</span>
              </span>
              <ChevronsUpDown className="size-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {memberships.map((membership) => {
              const isActive = membership.organizationId === activeOrganization.organizationId;
              const isPending = pendingOrgId === membership.organizationId;
              return (
                <DropdownMenuItem
                  key={membership.organizationId}
                  disabled={isPending}
                  onClick={() => handleSwitch(membership.organizationId)}
                  className="flex items-center justify-between"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{membership.organizationName}</span>
                    <span className="text-xs text-muted-foreground">{membership.role}</span>
                  </span>
                  <Check className={cn('size-4', isActive ? 'opacity-100' : 'opacity-0')} />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

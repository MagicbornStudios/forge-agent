'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, User } from 'lucide-react';
import { WorkspaceButton } from '@forge/shared/components/workspace';
import { FeatureGate } from '@forge/shared';
import { CAPABILITIES } from '@forge/shared/entitlements';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@forge/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@forge/ui/avatar';
import { useMe } from '@/lib/data/hooks';
import { API_ROUTES } from '@/lib/api-client/routes';
import { logout } from '@/lib/api-client/auth';
import { authKeys } from '@/lib/data/keys';
import { SignInSheet } from './SignInSheet';

async function openConnectOnboarding(): Promise<void> {
  const res1 = await fetch(API_ROUTES.STRIPE_CONNECT_CREATE_ACCOUNT, {
    method: 'POST',
    credentials: 'include',
  });
  const data1 = await res1.json();
  if (!res1.ok) throw new Error(data1?.error ?? 'Failed to set up account');
  const res2 = await fetch(API_ROUTES.STRIPE_CONNECT_ONBOARDING_LINK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
    }),
  });
  const data2 = await res2.json();
  if (!res2.ok) throw new Error(data2?.error ?? 'Failed to get onboarding link');
  if (data2?.url) window.location.href = data2.url;
}

function getInitial(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email?.trim()) return email.slice(0, 2).toUpperCase();
  return '?';
}

function getDisplayName(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) return name.trim();
  if (email?.trim()) return email.trim();
  return 'User';
}

export function AppBarUser() {
  const { data, isLoading } = useMe();
  const user = data?.user ?? null;
  const queryClient = useQueryClient();
  const router = useRouter();
  const [signInOpen, setSignInOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  if (isLoading) {
    return (
      <WorkspaceButton variant="ghost" size="sm" disabled>
        <User className="size-3 shrink-0" />
        <span className="hidden sm:inline">…</span>
      </WorkspaceButton>
    );
  }

  if (!user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <WorkspaceButton variant="ghost" size="sm">
              <User className="size-3 shrink-0" />
              <span className="hidden sm:inline">Not signed in</span>
            </WorkspaceButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="text-xs">
              Not signed in
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={() => setSignInOpen(true)}>
              <LogIn className="mr-2 size-4" />
              Sign in
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SignInSheet open={signInOpen} onOpenChange={setSignInOpen} />
      </>
    );
  }

  const initial = getInitial(user.name, user.email);
  const displayName = getDisplayName(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <WorkspaceButton variant="ghost" size="sm">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline truncate max-w-[120px]">{displayName}</span>
        </WorkspaceButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled className="text-xs font-medium">
          Signed in as {displayName}
        </DropdownMenuItem>
        <FeatureGate capability={CAPABILITIES.PLATFORM_LIST} mode="hide">
          <>
            <DropdownMenuSeparator />
            {!user?.stripeConnectAccountId && (
              <DropdownMenuItem
                className="text-xs"
                disabled={connectLoading}
                onClick={async () => {
                  setConnectLoading(true);
                  try {
                    await openConnectOnboarding();
                  } catch {
                    setConnectLoading(false);
                  }
                }}
              >
                {connectLoading ? 'Opening…' : 'Set up payouts'}
              </DropdownMenuItem>
            )}
          </>
        </FeatureGate>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs"
          onClick={async () => {
            try {
              await logout();
            } catch {
              // still clear UI (e.g. session already gone)
            }
            await queryClient.invalidateQueries({ queryKey: authKeys.me() });
            router?.refresh?.();
          }}
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

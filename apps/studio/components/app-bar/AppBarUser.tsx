'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { EditorButton } from '@forge/shared/components/editor';
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
import { CreateListingSheet } from '@/components/listings/CreateListingSheet';

async function openConnectOnboarding(): Promise<void> {
  const res1 = await fetch('/api/stripe/connect/create-account', {
    method: 'POST',
    credentials: 'include',
  });
  const data1 = await res1.json();
  if (!res1.ok) throw new Error(data1?.error ?? 'Failed to set up account');
  const res2 = await fetch('/api/stripe/connect/onboarding-link', {
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
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  if (isLoading) {
    return (
      <EditorButton variant="ghost" size="sm" disabled tooltip="Loading…">
        <User className="size-3 shrink-0" />
        <span className="hidden sm:inline">…</span>
      </EditorButton>
    );
  }

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EditorButton variant="ghost" size="sm" tooltip="Not signed in">
            <User className="size-3 shrink-0" />
            <span className="hidden sm:inline">Not signed in</span>
          </EditorButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="text-xs">Not signed in</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const initial = getInitial(user.name, user.email);
  const displayName = getDisplayName(user.name, user.email);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EditorButton variant="ghost" size="sm" tooltip={`Signed in as ${displayName}`}>
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline truncate max-w-[120px]">{displayName}</span>
        </EditorButton>
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
            <DropdownMenuItem
              className="text-xs"
              onClick={() => setCreateListingOpen(true)}
            >
              List in catalog
            </DropdownMenuItem>
          </>
        </FeatureGate>
      </DropdownMenuContent>
    </DropdownMenu>
    <CreateListingSheet open={createListingOpen} onOpenChange={setCreateListingOpen} />
  </>
  );
}

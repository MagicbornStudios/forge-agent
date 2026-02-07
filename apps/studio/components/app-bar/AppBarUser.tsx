'use client';

import React from 'react';
import { User } from 'lucide-react';
import { EditorButton } from '@forge/shared/components/editor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@forge/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@forge/ui/avatar';
import { useMe } from '@/lib/data/hooks';

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

  if (isLoading) {
    return (
      <EditorButton variant="ghost" size="sm" disabled tooltip="Loading…">
        <User className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">…</span>
      </EditorButton>
    );
  }

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EditorButton variant="ghost" size="sm" tooltip="Not signed in">
            <User className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Not signed in</span>
          </EditorButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>Not signed in</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const initial = getInitial(user.name, user.email);
  const displayName = getDisplayName(user.name, user.email);

  return (
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
        <DropdownMenuItem disabled className="font-medium">
          Signed in as {displayName}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

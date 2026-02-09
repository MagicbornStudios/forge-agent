'use client';

import React from 'react';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/ui/lib/utils';
import { getInitials } from '@/lib/domains/character/operations';
import type { CharacterDoc } from '@/lib/domains/character/types';

interface Props {
  characters: CharacterDoc[];
  activeCharacterId: number | null;
  searchQuery: string;
  onSelect: (id: number) => void;
}

export function CharacterList({ characters, activeCharacterId, searchQuery, onSelect }: Props) {
  const filtered = searchQuery
    ? characters.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : characters;

  if (filtered.length === 0) {
    return (
      <div className="px-[var(--panel-padding)] py-6 text-center text-xs text-muted-foreground">
        {searchQuery ? 'No characters match your search.' : 'No characters yet.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {filtered.map((char) => (
        <Button
          key={char.id}
          type="button"
          variant="ghost"
          onClick={() => onSelect(char.id)}
          className={cn(
            'flex h-auto items-center justify-start gap-3 px-[var(--panel-padding)] py-[var(--control-padding-y)] hover:bg-accent/50',
            char.id === activeCharacterId && 'bg-accent',
          )}
        >
          {char.imageUrl ? (
            <img
              src={char.imageUrl}
              alt={char.name}
              className="h-8 w-8 shrink-0 rounded-full border object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {getInitials(char.name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{char.name}</div>
            {char.description && (
              <div className="truncate text-xs text-muted-foreground">
                {char.description.slice(0, 50)}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}

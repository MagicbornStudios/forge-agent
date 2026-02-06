'use client';

import React from 'react';
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
      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
        {searchQuery ? 'No characters match your search.' : 'No characters yet.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {filtered.map((char) => (
        <button
          key={char.id}
          type="button"
          onClick={() => onSelect(char.id)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 text-left hover:bg-accent/50 transition-colors',
            char.id === activeCharacterId && 'bg-accent',
          )}
        >
          {char.imageUrl ? (
            <img
              src={char.imageUrl}
              alt={char.name}
              className="w-8 h-8 rounded-full object-cover border flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
              {getInitials(char.name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{char.name}</div>
            {char.description && (
              <div className="text-xs text-muted-foreground truncate">
                {char.description.slice(0, 50)}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

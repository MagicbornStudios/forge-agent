'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { resolveRelId } from '@/lib/domains/character/operations';
import type { CharacterDoc, RelationshipDoc } from '@/lib/domains/character/types';

interface Props {
  relationships: RelationshipDoc[];
  characters: CharacterDoc[];
  activeCharacterId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export function RelationshipsList({
  relationships,
  characters,
  activeCharacterId,
  onSelect,
  onDelete,
}: Props) {
  const charMap = new Map(characters.map((c) => [c.id, c]));

  // Filter to relationships involving the active character.
  const relevant = activeCharacterId
    ? relationships.filter((r) => {
        const src = resolveRelId(r.sourceCharacter);
        const tgt = resolveRelId(r.targetCharacter);
        return src === activeCharacterId || tgt === activeCharacterId;
      })
    : relationships;

  if (relevant.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
        {activeCharacterId ? 'No relationships for this character.' : 'No relationships yet.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      {relevant.map((rel) => {
        const srcId = resolveRelId(rel.sourceCharacter);
        const tgtId = resolveRelId(rel.targetCharacter);
        const other = activeCharacterId
          ? charMap.get(srcId === activeCharacterId ? tgtId : srcId)
          : null;

        return (
          <div
            key={rel.id}
            className="flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onSelect(rel.id)}
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {other ? other.name : `${charMap.get(srcId)?.name ?? srcId} → ${charMap.get(tgtId)?.name ?? tgtId}`}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {rel.label}
                {rel.description ? ` — ${rel.description.slice(0, 40)}` : ''}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(rel.id);
              }}
              className="ml-2 shrink-0 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1 size-3.5" />
              Remove
            </Button>
          </div>
        );
      })}
    </div>
  );
}

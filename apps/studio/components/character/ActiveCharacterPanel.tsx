'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Separator } from '@forge/ui/separator';
import { getInitials } from '@/lib/domains/character/operations';
import type { CharacterDoc } from '@/lib/domains/character/types';
import { CharacterImageGenerator } from './CharacterImageGenerator';

interface Props {
  character: CharacterDoc | null;
  onUpdate: (id: number, updates: Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl'>>) => void;
}

export function ActiveCharacterPanel({ character, onUpdate }: Props) {
  const [showImageGen, setShowImageGen] = useState(false);

  const handleNameBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (!character) return;
      const name = e.target.value.trim();
      if (name && name !== character.name) {
        onUpdate(character.id, { name });
      }
    },
    [character, onUpdate],
  );

  const handleDescBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!character) return;
      const description = e.target.value.trim();
      if (description !== (character.description ?? '')) {
        onUpdate(character.id, { description });
      }
    },
    [character, onUpdate],
  );

  if (!character) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center text-sm text-muted-foreground">
        Select a character to view details, or create a new one.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* Portrait */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-full aspect-[3/4] rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-muted-foreground select-none">
              {getInitials(character.name)}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowImageGen(!showImageGen)}
        >
          {showImageGen ? 'Close Generator' : 'Generate Portrait'}
        </Button>
      </div>

      {/* Image generator */}
      {showImageGen && (
        <CharacterImageGenerator
          character={character}
          onImageGenerated={(imageUrl) => {
            onUpdate(character.id, { imageUrl });
            setShowImageGen(false);
          }}
        />
      )}

      <Separator />

      {/* Name */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Name
        </label>
        <Input
          key={character.id}
          defaultValue={character.name}
          onBlur={handleNameBlur}
          className="text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </label>
        <Textarea
          key={character.id}
          defaultValue={character.description ?? ''}
          onBlur={handleDescBlur}
          rows={5}
          className="text-sm resize-none"
        />
      </div>
    </div>
  );
}

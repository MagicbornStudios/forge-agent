'use client';

import React, { useState } from 'react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@forge/ui/tabs';
import { CharacterList } from './CharacterList';
import { RelationshipsList } from './RelationshipsList';
import type { CharacterDoc, RelationshipDoc } from '@/lib/domains/character/types';

interface Props {
  characters: CharacterDoc[];
  relationships: RelationshipDoc[];
  activeCharacterId: number | null;
  onSelectCharacter: (id: number) => void;
  onSelectRelationship: (id: number) => void;
  onDeleteRelationship: (id: number) => void;
  onCreateCharacter: () => void;
}

export function CharacterSidebar({
  characters,
  relationships,
  activeCharacterId,
  onSelectCharacter,
  onSelectRelationship,
  onDeleteRelationship,
  onCreateCharacter,
}: Props) {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="characters" className="flex flex-col h-full">
        <TabsList className="mx-2 mt-2 shrink-0">
          <TabsTrigger value="characters" className="flex-1 text-xs">
            Characters
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex-1 text-xs">
            Relationships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="p-2 space-y-2 shrink-0">
            <Input
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onCreateCharacter}
            >
              + New Character
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <CharacterList
              characters={characters}
              activeCharacterId={activeCharacterId}
              searchQuery={search}
              onSelect={onSelectCharacter}
            />
          </div>
        </TabsContent>

        <TabsContent value="relationships" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="flex-1 overflow-y-auto">
            <RelationshipsList
              relationships={relationships}
              characters={characters}
              activeCharacterId={activeCharacterId}
              onSelect={onSelectRelationship}
              onDelete={onDeleteRelationship}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

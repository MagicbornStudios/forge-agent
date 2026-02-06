'use client';

import React, { useState } from 'react';
import { Users, Link2, Boxes } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { CharacterList } from './CharacterList';
import { RelationshipsList } from './RelationshipsList';
import type { CharacterDoc, RelationshipDoc } from '@/lib/domains/character/types';
import { GraphSidebar } from '@/components/graph/GraphSidebar';
import { NodePalette, type NodePaletteItem } from '@/components/graph/NodePalette';

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

  const nodeItems: NodePaletteItem[] = [
    {
      id: 'character',
      label: 'Character',
      icon: <Users size={14} />,
      category: 'entities',
      description: 'Create a new character node',
      dragType: 'character',
    },
  ];

  const charactersTab = (
    <div className="flex-1 flex flex-col min-h-0">
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
    </div>
  );

  const relationshipsTab = (
    <div className="flex-1 overflow-y-auto">
      <RelationshipsList
        relationships={relationships}
        characters={characters}
        activeCharacterId={activeCharacterId}
        onSelect={onSelectRelationship}
        onDelete={onDeleteRelationship}
      />
    </div>
  );

  const nodesTab = (
    <NodePalette
      items={nodeItems}
      title="Nodes"
      className="h-full"
    />
  );

  return (
    <GraphSidebar
      className="h-full bg-[var(--color-df-sidebar-bg)]"
      tabs={[
        {
          id: 'characters',
          label: 'Characters',
          icon: <Users size={12} />,
          content: charactersTab,
          accentColor: 'var(--color-df-info)',
          accentMutedColor: 'color-mix(in oklab, var(--color-df-info) 40%, transparent)',
        },
        {
          id: 'relationships',
          label: 'Relations',
          icon: <Link2 size={12} />,
          content: relationshipsTab,
          accentColor: 'var(--color-df-edge-choice-1)',
          accentMutedColor: 'color-mix(in oklab, var(--color-df-edge-choice-1) 40%, transparent)',
        },
        {
          id: 'nodes',
          label: 'Nodes',
          icon: <Boxes size={12} />,
          content: nodesTab,
          accentColor: 'var(--color-df-warning)',
          accentMutedColor: 'color-mix(in oklab, var(--color-df-warning) 40%, transparent)',
        },
      ]}
    />
  );
}

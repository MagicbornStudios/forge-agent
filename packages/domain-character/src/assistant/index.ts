'use client';

import { useMemo } from 'react';
import type { Selection } from '@forge/shared';
import type { DomainAssistantContract, DomainContextSnapshot } from '@forge/shared/assistant';
import type { CharacterDoc, RelationshipDoc } from '@forge/types/character';
import { buildCharacterContext } from '../copilot/context';
import { getCharacterSuggestions } from '../copilot/suggestions';
import { createCharacterAssistantTools } from './tools';

export interface CharacterAssistantDeps {
  characters: CharacterDoc[];
  relationships: RelationshipDoc[];
  activeCharacterId: number | null;
  projectId: number | null;
  selection: Selection | null;
  isDirty: boolean;
  createCharacter: (data: {
    name: string;
    description?: string;
    imageUrl?: string;
    voiceId?: string | null;
  }) => Promise<CharacterDoc>;
  updateCharacter: (
    id: number,
    updates: Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl' | 'voiceId'>>,
  ) => Promise<void>;
  createRelationship: (data: {
    source: number;
    target: number;
    label: string;
    description?: string;
  }) => Promise<RelationshipDoc>;
  generateImage: (prompt: string) => Promise<{ imageUrl: string }>;
  setActiveCharacter: (id: number | null) => void;
  onAIHighlight: (entities: Record<string, string[]>) => void;
  clearAIHighlights: () => void;
}

export function useCharacterAssistantContract(
  deps: CharacterAssistantDeps,
): DomainAssistantContract {
  const {
    characters,
    relationships,
    activeCharacterId,
    projectId,
    selection,
    isDirty,
    createCharacter,
    updateCharacter,
    createRelationship,
    generateImage,
    setActiveCharacter,
    onAIHighlight,
    clearAIHighlights,
  } = deps;

  return useMemo<DomainAssistantContract>(
    () => ({
      domain: 'character',

      getContextSnapshot: (): DomainContextSnapshot => {
        const legacyContext = buildCharacterContext({
          characters,
          relationships,
          activeCharacterId,
          projectId,
          selection,
          isDirty,
        });

        return {
          domain: 'character',
          domainState: legacyContext.domainState,
          selectionSummary: legacyContext.selectionSummary,
        };
      },

      getInstructions: () =>
        'You are helping manage characters and relationships. ' +
        'Use character_getContext first when the request needs existing IDs or state. ' +
        'Use character_create and character_update for entity changes. ' +
        'Use character_createRelationship to connect characters. ' +
        'Use character_generatePortrait for image generation. ' +
        'Do not claim changes succeeded unless tool results confirm success.',

      createTools: () =>
        createCharacterAssistantTools({
          getCharacters: () => characters,
          getRelationships: () => relationships,
          getProjectId: () => projectId,
          createCharacter,
          updateCharacter,
          createRelationship,
          generateImage,
          setActiveCharacter,
          onAIHighlight,
        }),

      getSuggestions: () =>
        getCharacterSuggestions({
          characters,
          relationships,
          activeCharacterId,
        }),

      onHighlight: (entities) => onAIHighlight(entities),
      clearHighlights: clearAIHighlights,
    }),
    [
      characters,
      relationships,
      activeCharacterId,
      projectId,
      selection,
      isDirty,
      createCharacter,
      updateCharacter,
      createRelationship,
      generateImage,
      setActiveCharacter,
      onAIHighlight,
      clearAIHighlights,
    ],
  );
}

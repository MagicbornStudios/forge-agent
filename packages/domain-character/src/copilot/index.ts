'use client';

import { useMemo } from 'react';
import type {
  DomainCopilotContract,
  AIHighlightPayload,
} from '@forge/shared/copilot/types';
import type { Selection } from '@forge/shared/workspace/selection';
import type { CharacterDoc, RelationshipDoc } from '@forge/types/character';
import { createCharacterActions } from './actions';
import { buildCharacterContext } from './context';
import { getCharacterSuggestions } from './suggestions';

// ---------------------------------------------------------------------------
// Dependency interface
// ---------------------------------------------------------------------------

/** Everything the character copilot contract needs from the workspace. */
export interface CharacterCopilotDeps {
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
  }) => Promise<CharacterDoc>;
  updateCharacter: (
    id: number,
    updates: Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl'>>,
  ) => Promise<void>;
  createRelationship: (data: {
    source: number;
    target: number;
    label: string;
    description?: string;
  }) => Promise<RelationshipDoc>;
  generateImage: (prompt: string) => Promise<{ imageUrl: string }>;
  setActiveCharacter: (id: number | null) => void;
  onAIHighlight: (payload: AIHighlightPayload) => void;
  clearAIHighlights: () => void;
}

// ---------------------------------------------------------------------------
// Contract factory hook
// ---------------------------------------------------------------------------

/**
 * Build the character domain's `DomainCopilotContract`.
 *
 * Usage in the character workspace component:
 * ```ts
 * const contract = useCharacterContract(deps);
 * useDomainCopilot(contract, { toolsEnabled });
 * ```
 */
export function useCharacterContract(deps: CharacterCopilotDeps): DomainCopilotContract {
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

  return useMemo<DomainCopilotContract>(
    () => ({
      domain: 'character',

      getContextSnapshot: () =>
        buildCharacterContext({
          characters,
          relationships,
          activeCharacterId,
          projectId,
          selection,
          isDirty,
        }),

      getInstructions: () =>
        'You are helping manage characters and their relationships. ' +
        'Use character_getCharacters to see the current state. ' +
        'Use character_createCharacter to add characters, character_generatePortrait to create AI portraits, ' +
        'and character_createRelationship to connect characters. ' +
        'Use character_suggestRelationships to analyze characters before suggesting relationships. ' +
        'Always call character_getCharacters first when the user asks about existing characters.',

      createActions: () =>
        createCharacterActions({
          getCharacters: () => characters,
          getRelationships: () => relationships,
          getActiveCharacterId: () => activeCharacterId,
          getProjectId: () => projectId,
          createCharacter,
          updateCharacter,
          createRelationship,
          generateImage,
          setActiveCharacter,
          onAIHighlight,
        }),

      getSuggestions: () =>
        getCharacterSuggestions({ characters, relationships, activeCharacterId }),

      onAIHighlight,
      clearAIHighlights,
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

import type { CharacterContextSnapshot } from '../context/assemblers/character';

export type CharacterWorkflowKind =
  | 'character_create'
  | 'character_update'
  | 'character_relationship'
  | 'character_portrait'
  | 'character_general';

export interface CharacterCoreWorkflowInput {
  intent: string;
  context?: CharacterContextSnapshot;
}

export interface CharacterCoreWorkflowOutput {
  kind: CharacterWorkflowKind;
  hints: string[];
}

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

export function runCharacterCoreWorkflow(
  input: CharacterCoreWorkflowInput,
): CharacterCoreWorkflowOutput {
  const intent = input.intent.toLowerCase();

  if (includesAny(intent, ['portrait', 'image', 'face', 'art'])) {
    return {
      kind: 'character_portrait',
      hints: ['Prefer character_generatePortrait after confirming a target character.'],
    };
  }

  if (includesAny(intent, ['relationship', 'connect', 'rival', 'friend', 'family'])) {
    return {
      kind: 'character_relationship',
      hints: ['Use character_createRelationship with two existing character IDs.'],
    };
  }

  if (includesAny(intent, ['rename', 'update', 'change', 'edit'])) {
    return {
      kind: 'character_update',
      hints: ['Use character_update with a specific characterId and only changed fields.'],
    };
  }

  if (includesAny(intent, ['create', 'new character', 'add character', 'make character'])) {
    return {
      kind: 'character_create',
      hints: ['Use character_create and keep description concise and actionable.'],
    };
  }

  const populationHint =
    input.context && input.context.characterCount > 0
      ? `Current character count: ${input.context.characterCount}.`
      : 'No characters currently loaded.';

  return {
    kind: 'character_general',
    hints: [populationHint, 'Start with character_getContext when intent is ambiguous.'],
  };
}

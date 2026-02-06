import type { DomainSuggestion } from '@forge/shared/copilot/types';
import type { CharacterDoc, RelationshipDoc } from '@forge/types/character';

export interface CharacterSuggestionDeps {
  characters: CharacterDoc[];
  relationships: RelationshipDoc[];
  activeCharacterId: number | null;
}

export function getCharacterSuggestions(deps: CharacterSuggestionDeps): DomainSuggestion[] {
  const { characters, relationships, activeCharacterId } = deps;
  const suggestions: DomainSuggestion[] = [];

  if (characters.length === 0) {
    suggestions.push({
      title: 'Create a character',
      message: 'Create my first character for this project.',
    });
    return suggestions;
  }

  if (characters.length === 1) {
    suggestions.push({
      title: 'Add more characters',
      message: 'Create a few more characters so I can build relationships between them.',
    });
  }

  if (characters.length >= 2 && relationships.length === 0) {
    suggestions.push({
      title: 'Create relationships',
      message: 'Suggest and create relationships between my characters.',
    });
  }

  const activeChar = characters.find((c) => c.id === activeCharacterId);
  if (activeChar) {
    if (!activeChar.imageUrl) {
      suggestions.push({
        title: 'Generate portrait',
        message: `Generate a portrait for ${activeChar.name}.`,
      });
    }
    if (!activeChar.description) {
      suggestions.push({
        title: 'Write description',
        message: `Write a description for ${activeChar.name}.`,
      });
    }
  }

  if (characters.length >= 3) {
    suggestions.push({
      title: 'Suggest relationships',
      message: 'Analyze my characters and suggest possible relationships between them.',
    });
  }

  return suggestions;
}

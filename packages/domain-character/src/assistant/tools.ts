import type { DomainTool, DomainToolContext } from '@forge/shared/assistant';
import type { CharacterDoc, RelationshipDoc } from '@forge/types/character';
import {
  renderCharacterCreated,
  renderPortraitGenerated,
  renderRelationshipCreated,
} from '../copilot/generative-ui';

export interface CharacterAssistantToolsDeps {
  getCharacters: () => CharacterDoc[];
  getRelationships: () => RelationshipDoc[];
  getProjectId: () => number | null;
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
}

function paramsToSchema(
  params: Array<{ name: string; type: string; description?: string; required?: boolean }>
): { type: 'object'; properties: Record<string, unknown>; required?: string[] } {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const param of params) {
    properties[param.name] = {
      type: param.type,
      ...(param.description ? { description: param.description } : {}),
    };
    if (param.required) required.push(param.name);
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

export function createCharacterAssistantTools(deps: CharacterAssistantToolsDeps): DomainTool[] {
  const {
    getCharacters,
    getRelationships,
    getProjectId,
    createCharacter,
    updateCharacter,
    createRelationship,
    generateImage,
    setActiveCharacter,
    onAIHighlight,
  } = deps;

  return [
    {
      domain: 'character',
      name: 'character_getContext',
      description: 'Return character and relationship context for the active project.',
      parameters: paramsToSchema([]),
      execute: async (_args: unknown, context: DomainToolContext) => {
        const characters = getCharacters();
        const relationships = getRelationships();

        return {
          success: true,
          message: 'Character context loaded.',
          data: {
            projectId: getProjectId(),
            characterCount: characters.length,
            relationshipCount: relationships.length,
            characters: characters.map((character) => ({
              id: character.id,
              name: character.name,
              description: character.description,
              imageUrl: character.imageUrl,
            })),
            relationships: relationships.map((relationship) => ({
              id: relationship.id,
              label: relationship.label,
              sourceCharacter: relationship.sourceCharacter,
              targetCharacter: relationship.targetCharacter,
            })),
            selectionSummary: context.snapshot.selectionSummary,
          },
        };
      },
    },
    {
      domain: 'character',
      name: 'character_create',
      description: 'Create a new character in the active project.',
      parameters: paramsToSchema([
        { name: 'name', type: 'string', description: 'Character name', required: true },
        { name: 'description', type: 'string', description: 'Character description', required: false },
      ]),
      execute: async (args: unknown) => {
        const projectId = getProjectId();
        if (projectId == null) {
          return { success: false, message: 'No active project.' };
        }

        const input = (args as Record<string, unknown>) ?? {};
        const created = await createCharacter({
          name: String(input.name ?? 'New Character'),
          description:
            typeof input.description === 'string' && input.description.trim().length > 0
              ? input.description
              : undefined,
        });

        setActiveCharacter(created.id);
        onAIHighlight({ 'character.node': [String(created.id)] });

        return {
          success: true,
          message: `Created character \"${created.name}\".`,
          data: {
            characterId: created.id,
            name: created.name,
          },
        };
      },
      render: (result) => renderCharacterCreated({ status: 'complete', result: result as never }),
    },
    {
      domain: 'character',
      name: 'character_update',
      description: 'Update a character by id.',
      parameters: paramsToSchema([
        { name: 'characterId', type: 'number', description: 'Character ID', required: true },
        { name: 'name', type: 'string', description: 'New name', required: false },
        { name: 'description', type: 'string', description: 'New description', required: false },
        { name: 'imageUrl', type: 'string', description: 'New image URL', required: false },
      ]),
      execute: async (args: unknown) => {
        const input = (args as Record<string, unknown>) ?? {};
        const characterId = Number(input.characterId);
        if (!Number.isFinite(characterId) || characterId <= 0) {
          return { success: false, message: 'characterId must be a positive number.' };
        }

        await updateCharacter(characterId, {
          ...(input.name !== undefined ? { name: String(input.name) } : {}),
          ...(input.description !== undefined ? { description: String(input.description) } : {}),
          ...(input.imageUrl !== undefined ? { imageUrl: String(input.imageUrl) } : {}),
        });

        onAIHighlight({ 'character.node': [String(characterId)] });

        return {
          success: true,
          message: `Updated character ${characterId}.`,
          data: { characterId },
        };
      },
    },
    {
      domain: 'character',
      name: 'character_createRelationship',
      description: 'Create a relationship between two characters.',
      parameters: paramsToSchema([
        { name: 'sourceCharacterId', type: 'number', description: 'Source character ID', required: true },
        { name: 'targetCharacterId', type: 'number', description: 'Target character ID', required: true },
        { name: 'label', type: 'string', description: 'Relationship label', required: true },
        { name: 'description', type: 'string', description: 'Relationship description', required: false },
      ]),
      execute: async (args: unknown) => {
        const input = (args as Record<string, unknown>) ?? {};
        const sourceCharacterId = Number(input.sourceCharacterId);
        const targetCharacterId = Number(input.targetCharacterId);

        if (!Number.isFinite(sourceCharacterId) || !Number.isFinite(targetCharacterId)) {
          return { success: false, message: 'sourceCharacterId and targetCharacterId must be numbers.' };
        }

        const characters = getCharacters();
        const source = characters.find((character) => character.id === sourceCharacterId);
        const target = characters.find((character) => character.id === targetCharacterId);
        if (!source || !target) {
          return {
            success: false,
            message: 'One or both characters were not found in the active project.',
          };
        }

        const relationship = await createRelationship({
          source: sourceCharacterId,
          target: targetCharacterId,
          label: String(input.label ?? 'related to'),
          description:
            typeof input.description === 'string' && input.description.trim().length > 0
              ? input.description
              : undefined,
        });

        onAIHighlight({
          'character.node': [String(sourceCharacterId), String(targetCharacterId)],
          'character.relationship': [String(relationship.id)],
        });

        return {
          success: true,
          message: 'Relationship created.',
          data: {
            id: relationship.id,
            label: relationship.label,
            sourceName: source.name,
            targetName: target.name,
          },
        };
      },
      render: (result) => renderRelationshipCreated({ status: 'complete', result: result as never }),
    },
    {
      domain: 'character',
      name: 'character_generatePortrait',
      description: 'Generate and assign an AI portrait to a character.',
      parameters: paramsToSchema([
        { name: 'characterId', type: 'number', description: 'Character ID', required: true },
        {
          name: 'styleHint',
          type: 'string',
          description: 'Optional style hint for the portrait.',
          required: false,
        },
      ]),
      execute: async (args: unknown) => {
        const input = (args as Record<string, unknown>) ?? {};
        const characterId = Number(input.characterId);

        if (!Number.isFinite(characterId) || characterId <= 0) {
          return { success: false, message: 'characterId must be a positive number.' };
        }

        const character = getCharacters().find((item) => item.id === characterId);
        if (!character) {
          return { success: false, message: `Character ${characterId} not found.` };
        }

        const styleHint =
          typeof input.styleHint === 'string' && input.styleHint.trim().length > 0
            ? input.styleHint.trim()
            : 'cinematic character portrait';
        const prompt = `${styleHint} of ${character.name}. ${character.description ?? ''}`.trim();

        const { imageUrl } = await generateImage(prompt);
        await updateCharacter(characterId, { imageUrl });
        onAIHighlight({ 'character.node': [String(characterId)] });

        return {
          success: true,
          message: `Portrait generated for ${character.name}.`,
          data: {
            imageUrl,
            characterName: character.name,
          },
        };
      },
      render: (result) => renderPortraitGenerated({ status: 'complete', result: result as never }),
    },
  ];
}

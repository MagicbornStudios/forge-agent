import type {
  CopilotActionConfig,
  CopilotActionParameter,
  AIHighlightPayload,
} from '@forge/shared/copilot/types';
import { createDomainAction } from '@forge/shared/copilot';
import type { CharacterDoc, RelationshipDoc } from '@forge/types/character';
import {
  renderCharacterCreated,
  renderPortraitGenerated,
  renderRelationshipCreated,
} from './generative-ui';

// ---------------------------------------------------------------------------
// Dependency interface
// ---------------------------------------------------------------------------

export interface CharacterActionsDeps {
  getCharacters: () => CharacterDoc[];
  getRelationships: () => RelationshipDoc[];
  getActiveCharacterId: () => number | null;
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
  onAIHighlight: (payload: AIHighlightPayload) => void;
}

// ---------------------------------------------------------------------------
// Action factory
// ---------------------------------------------------------------------------

/**
 * Produce all CopilotKit action configs for the character domain.
 *
 * Names are prefixed via `createDomainAction('character', ...)`.
 */
export function createCharacterActions(deps: CharacterActionsDeps): CopilotActionConfig[] {
  const {
    getCharacters,
    getRelationships,
    getActiveCharacterId,
    getProjectId,
    createCharacter,
    updateCharacter,
    createRelationship,
    generateImage,
    setActiveCharacter,
    onAIHighlight,
  } = deps;

  const actions = [
    // -----------------------------------------------------------------
    // createCharacter
    // -----------------------------------------------------------------
    {
      name: 'createCharacter',
      description:
        'Create a new character in the project. Use when the user asks to add a character.',
      parameters: [
        { name: 'name', type: 'string' as const, description: 'Character name', required: true },
        {
          name: 'description',
          type: 'string' as const,
          description: 'Short character description',
          required: false,
        },
      ],
      handler: async (args: Record<string, unknown>) => {
        if (!getProjectId()) return { success: false, message: 'No active project.' };
        try {
          const created = await createCharacter({
            name: String(args.name ?? 'New Character'),
            description: args.description ? String(args.description) : undefined,
          });
          setActiveCharacter(created.id);
          onAIHighlight({ entities: { 'character.node': [String(created.id)] } });
          return {
            success: true,
            message: `Created character "${created.name}".`,
            data: { characterId: created.id, name: created.name },
          };
        } catch (err) {
          return {
            success: false,
            message: err instanceof Error ? err.message : 'Failed to create character.',
          };
        }
      },
      render: renderCharacterCreated,
    },

    // -----------------------------------------------------------------
    // updateCharacter
    // -----------------------------------------------------------------
    {
      name: 'updateCharacter',
      description:
        'Update an existing character. Specify characterId and the fields to change.',
      parameters: [
        {
          name: 'characterId',
          type: 'number' as const,
          description: 'ID of the character to update',
          required: true,
        },
        { name: 'name', type: 'string' as const, description: 'New name', required: false },
        {
          name: 'description',
          type: 'string' as const,
          description: 'New description',
          required: false,
        },
        {
          name: 'imageUrl',
          type: 'string' as const,
          description: 'New image URL',
          required: false,
        },
      ],
      handler: async (args: Record<string, unknown>) => {
        const id = Number(args.characterId);
        const updates: Record<string, unknown> = {};
        if (args.name !== undefined) updates.name = String(args.name);
        if (args.description !== undefined) updates.description = String(args.description);
        if (args.imageUrl !== undefined) updates.imageUrl = String(args.imageUrl);

        try {
          await updateCharacter(id, updates);
          onAIHighlight({ entities: { 'character.node': [String(id)] } });
          return { success: true, message: `Updated character ${id}.` };
        } catch (err) {
          return {
            success: false,
            message: err instanceof Error ? err.message : 'Update failed.',
          };
        }
      },
    },

    // -----------------------------------------------------------------
    // generatePortrait
    // -----------------------------------------------------------------
    {
      name: 'generatePortrait',
      description:
        'Generate a portrait image for a character using AI. Builds a prompt from the character name and description.',
      parameters: [
        {
          name: 'characterId',
          type: 'number' as const,
          description: 'ID of the character to generate a portrait for',
          required: true,
        },
        {
          name: 'styleHint',
          type: 'string' as const,
          description:
            'Optional style hint (e.g. "fantasy illustration", "anime", "realistic photo")',
          required: false,
        },
      ],
      handler: async (args: Record<string, unknown>) => {
        const id = Number(args.characterId);
        const chars = getCharacters();
        const char = chars.find((c) => c.id === id);
        if (!char) return { success: false, message: `Character ${id} not found.` };

        const style = args.styleHint ? String(args.styleHint) : 'detailed character portrait';
        const prompt = `${style} of a character named "${char.name}". ${char.description ?? ''} High quality, detailed face, 3:4 aspect ratio.`.trim();

        try {
          const { imageUrl } = await generateImage(prompt);
          await updateCharacter(id, { imageUrl });
          onAIHighlight({ entities: { 'character.node': [String(id)] } });
          return {
            success: true,
            message: `Portrait generated for ${char.name}.`,
            data: { imageUrl, characterName: char.name },
          };
        } catch (err) {
          return {
            success: false,
            message: err instanceof Error ? err.message : 'Portrait generation failed.',
          };
        }
      },
      render: renderPortraitGenerated,
    },

    // -----------------------------------------------------------------
    // createRelationship
    // -----------------------------------------------------------------
    {
      name: 'createRelationship',
      description:
        'Create a relationship between two characters. Use when the user asks to connect characters.',
      parameters: [
        {
          name: 'sourceCharacterId',
          type: 'number' as const,
          description: 'Source character ID',
          required: true,
        },
        {
          name: 'targetCharacterId',
          type: 'number' as const,
          description: 'Target character ID',
          required: true,
        },
        {
          name: 'label',
          type: 'string' as const,
          description: 'Relationship label (e.g. "friend", "rival", "parent")',
          required: true,
        },
        {
          name: 'description',
          type: 'string' as const,
          description: 'Details about the relationship',
          required: false,
        },
      ],
      handler: async (args: Record<string, unknown>) => {
        const sourceId = Number(args.sourceCharacterId);
        const targetId = Number(args.targetCharacterId);
        const chars = getCharacters();
        const src = chars.find((c) => c.id === sourceId);
        const tgt = chars.find((c) => c.id === targetId);
        if (!src || !tgt) {
          return { success: false, message: 'One or both characters not found.' };
        }

        try {
          const rel = await createRelationship({
            source: sourceId,
            target: targetId,
            label: String(args.label ?? 'related'),
            description: args.description ? String(args.description) : undefined,
          });
          onAIHighlight({
            entities: {
              'character.node': [String(sourceId), String(targetId)],
              'character.relationship': [String(rel.id)],
            },
          });
          return {
            success: true,
            message: `Created relationship: ${src.name} — ${rel.label} — ${tgt.name}`,
            data: {
              relationshipId: rel.id,
              label: rel.label,
              sourceName: src.name,
              targetName: tgt.name,
            },
          };
        } catch (err) {
          return {
            success: false,
            message: err instanceof Error ? err.message : 'Failed to create relationship.',
          };
        }
      },
      render: renderRelationshipCreated,
    },

    // -----------------------------------------------------------------
    // suggestRelationships
    // -----------------------------------------------------------------
    {
      name: 'suggestRelationships',
      description:
        'Return the current character list so you can reason about and suggest possible relationships. Call this first, then use createRelationship for each suggestion the user approves.',
      parameters: [],
      handler: async () => {
        const chars = getCharacters();
        const rels = getRelationships();
        return {
          success: true,
          message: `${chars.length} characters, ${rels.length} existing relationships.`,
          data: {
            characters: chars.map((c) => ({
              id: c.id,
              name: c.name,
              description: c.description,
            })),
            existingRelationships: rels.map((r) => ({
              id: r.id,
              sourceId: typeof r.sourceCharacter === 'number' ? r.sourceCharacter : r.sourceCharacter.id,
              targetId: typeof r.targetCharacter === 'number' ? r.targetCharacter : r.targetCharacter.id,
              label: r.label,
            })),
          },
        };
      },
    },

    // -----------------------------------------------------------------
    // generateDescription
    // -----------------------------------------------------------------
    {
      name: 'generateDescription',
      description:
        'Generate a character description based on name and context. Returns a text description for the LLM to relay to the user, then use updateCharacter to save it.',
      parameters: [
        {
          name: 'characterId',
          type: 'number' as const,
          description: 'ID of the character',
          required: true,
        },
        {
          name: 'context',
          type: 'string' as const,
          description: 'Extra context or genre hints (e.g. "medieval fantasy knight")',
          required: false,
        },
      ],
      handler: async (args: Record<string, unknown>) => {
        const id = Number(args.characterId);
        const chars = getCharacters();
        const char = chars.find((c) => c.id === id);
        if (!char) return { success: false, message: `Character ${id} not found.` };

        // We return character info so the LLM can reason and write a description.
        return {
          success: true,
          message: `Use the character name and context to generate a rich description, then call character_updateCharacter to save it.`,
          data: {
            characterId: char.id,
            name: char.name,
            currentDescription: char.description,
            context: args.context ? String(args.context) : undefined,
          },
        };
      },
    },

    // -----------------------------------------------------------------
    // getCharacters (read-only)
    // -----------------------------------------------------------------
    {
      name: 'getCharacters',
      description:
        'Get the current list of characters and relationships. Call this before creating edges or suggesting relationships.',
      parameters: [],
      handler: async () => {
        const chars = getCharacters();
        const rels = getRelationships();
        const activeId = getActiveCharacterId();
        return {
          success: true,
          message: `${chars.length} characters, ${rels.length} relationships.`,
          data: {
            activeCharacterId: activeId,
            characters: chars.map((c) => ({
              id: c.id,
              name: c.name,
              description: c.description,
              imageUrl: c.imageUrl,
            })),
            relationships: rels.map((r) => ({
              id: r.id,
              sourceCharacterId:
                typeof r.sourceCharacter === 'number' ? r.sourceCharacter : r.sourceCharacter.id,
              targetCharacterId:
                typeof r.targetCharacter === 'number' ? r.targetCharacter : r.targetCharacter.id,
              label: r.label,
              description: r.description,
            })),
          },
        };
      },
    },
  ];

  return actions.map((action) =>
    createDomainAction('character', action as CopilotActionConfig<CopilotActionParameter[]>),
  ) as CopilotActionConfig[];
}

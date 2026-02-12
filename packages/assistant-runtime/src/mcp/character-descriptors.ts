import { buildMcpAppDescriptor, type DomainToolLike } from './domain-tool-to-mcp';
import type { McpAppDescriptor, McpToolDescriptor } from './types';

const CHARACTER_TOOLS: DomainToolLike[] = [
  {
    domain: 'character',
    name: 'character_getContext',
    description: 'Return character and relationship context for active project.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    domain: 'character',
    name: 'character_create',
    description: 'Create a character.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['name'],
    },
  },
  {
    domain: 'character',
    name: 'character_update',
    description: 'Update character fields by characterId.',
    parameters: {
      type: 'object',
      properties: {
        characterId: { type: 'number' },
        name: { type: 'string' },
        description: { type: 'string' },
        imageUrl: { type: 'string' },
      },
      required: ['characterId'],
    },
  },
  {
    domain: 'character',
    name: 'character_createRelationship',
    description: 'Create relationship between source and target character IDs.',
    parameters: {
      type: 'object',
      properties: {
        sourceCharacterId: { type: 'number' },
        targetCharacterId: { type: 'number' },
        label: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['sourceCharacterId', 'targetCharacterId', 'label'],
    },
  },
  {
    domain: 'character',
    name: 'character_generatePortrait',
    description: 'Generate portrait image URL for an existing character.',
    parameters: {
      type: 'object',
      properties: {
        characterId: { type: 'number' },
        styleHint: { type: 'string' },
      },
      required: ['characterId'],
    },
  },
];

export function createCharacterToolDescriptors(): McpToolDescriptor[] {
  return buildMcpAppDescriptor({
    id: 'character',
    name: 'Character',
    description: 'Character editor assistant tool descriptors (metadata-only).',
    tools: CHARACTER_TOOLS,
  }).tools;
}

export function createCharacterMcpAppDescriptor(): McpAppDescriptor {
  return buildMcpAppDescriptor({
    id: 'character',
    name: 'Character Assistant',
    description:
      'Character MCP app descriptor emitted from assistant tool contracts (server process deferred).',
    tools: CHARACTER_TOOLS,
    metadata: {
      phase: 'adapter-only',
      executableServer: false,
    },
  });
}

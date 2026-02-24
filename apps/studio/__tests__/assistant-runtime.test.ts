import {
  buildSessionKey,
  buildThreadId,
  createCharacterMcpAppDescriptor,
  createForgeMcpAppDescriptor,
  domainToolToMcp,
  runCharacterCoreWorkflow,
} from '@forge/assistant-runtime';

describe('assistant-runtime', () => {
  it('builds stable session and thread identifiers', () => {
    const locator = {
      userId: 42,
      projectId: 7,
      domain: 'forge' as const,
      workspaceId: 'dialogue' as const,
    };

    expect(buildSessionKey(locator)).toBe('session:42:dialogue:7');
    expect(buildThreadId(locator)).toBe('session:42:dialogue:7');
  });

  it('maps domain tools to MCP descriptors', () => {
    const descriptor = domainToolToMcp({
      domain: 'forge',
      name: 'forge_createPlan',
      description: 'Create a plan',
      parameters: {
        type: 'object',
        properties: {
          goal: { type: 'string' },
        },
        required: ['goal'],
      },
    });

    expect(descriptor).toEqual({
      domain: 'forge',
      name: 'forge_createPlan',
      description: 'Create a plan',
      inputSchema: {
        type: 'object',
        properties: {
          goal: { type: 'string' },
        },
        required: ['goal'],
      },
    });
  });

  it('exposes forge and character MCP app descriptors', () => {
    const forge = createForgeMcpAppDescriptor();
    const character = createCharacterMcpAppDescriptor();

    expect(forge.id).toBe('forge');
    expect(forge.tools.some((tool) => tool.name === 'forge_createStoryFromPremise')).toBe(
      true,
    );

    expect(character.id).toBe('character');
    expect(
      character.tools.some((tool) => tool.name === 'character_generatePortrait'),
    ).toBe(true);
  });

  it('classifies character workflow intents', () => {
    const portrait = runCharacterCoreWorkflow({
      intent: 'Generate a portrait for this hero',
    });
    expect(portrait.kind).toBe('character_portrait');

    const relationship = runCharacterCoreWorkflow({
      intent: 'Create a relationship between these two people',
    });
    expect(relationship.kind).toBe('character_relationship');
  });
});

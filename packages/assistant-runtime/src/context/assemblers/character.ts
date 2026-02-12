export interface CharacterSummary {
  id: number;
  name: string;
  description?: string;
}

export interface CharacterRelationshipSummary {
  id: number;
  label: string;
  sourceCharacterId: number | null;
  targetCharacterId: number | null;
}

export interface CharacterContextSnapshot {
  characterCount: number;
  relationshipCount: number;
  characters: CharacterSummary[];
  relationships: CharacterRelationshipSummary[];
}

interface PayloadClient {
  find(args: Record<string, unknown>): Promise<{ docs: Array<Record<string, unknown>> }>;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumber((value as { id?: unknown }).id);
  }
  return null;
}

export async function assembleCharacterContext(input: {
  payload: PayloadClient;
  projectId: number;
}): Promise<CharacterContextSnapshot> {
  const [charactersResult, relationshipsResult] = await Promise.all([
    input.payload.find({
      collection: 'characters',
      where: { project: { equals: input.projectId } },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    }),
    input.payload.find({
      collection: 'relationships',
      where: { project: { equals: input.projectId } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
  ]);

  const characters = charactersResult.docs.map((doc) => ({
    id: asNumber(doc.id) ?? 0,
    name: typeof doc.name === 'string' ? doc.name : 'Unnamed',
    description: typeof doc.description === 'string' ? doc.description : undefined,
  }));

  const relationships = relationshipsResult.docs.map((doc) => ({
    id: asNumber(doc.id) ?? 0,
    label: typeof doc.label === 'string' ? doc.label : 'related to',
    sourceCharacterId: asNumber(doc.sourceCharacter),
    targetCharacterId: asNumber(doc.targetCharacter),
  }));

  return {
    characterCount: characters.length,
    relationshipCount: relationships.length,
    characters,
    relationships,
  };
}

export function formatCharacterContext(context: CharacterContextSnapshot): string {
  if (context.characterCount === 0) {
    return 'Character context: no characters found for this project.';
  }

  const names = context.characters.map((character) => character.name).join(', ');
  return [
    `Character project context: ${context.characterCount} characters, ${context.relationshipCount} relationships.`,
    `Characters: ${names}`,
  ].join('\n');
}

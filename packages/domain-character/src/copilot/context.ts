import type { DomainContextSnapshot } from '@forge/shared/copilot/types';
import type { Selection } from '@forge/shared/workspace/selection';
import type { CharacterDoc, RelationshipDoc } from '@forge/types/character';

export interface CharacterContextDeps {
  characters: CharacterDoc[];
  relationships: RelationshipDoc[];
  activeCharacterId: number | null;
  projectId: number | null;
  selection: Selection | null;
  isDirty: boolean;
}

export function buildCharacterContext(deps: CharacterContextDeps): DomainContextSnapshot {
  const { characters, relationships, activeCharacterId, projectId, selection, isDirty } = deps;

  const activeChar = characters.find((c) => c.id === activeCharacterId);
  const selectionSummary = activeChar
    ? `Active character: ${activeChar.name}`
    : selection?.type === 'entity'
      ? `Selected: ${selection.entityType} ${selection.id}`
      : null;

  return {
    domain: 'character',
    workspaceId: 'character',
    selection,
    selectionSummary,
    domainState: {
      editorType: 'reactflow-character-graph',
      projectId,
      characterCount: characters.length,
      relationshipCount: relationships.length,
      activeCharacterId,
      activeCharacterName: activeChar?.name ?? null,
      characterNames: characters.map((c) => ({ id: c.id, name: c.name })),
      isDirty,
    },
  };
}

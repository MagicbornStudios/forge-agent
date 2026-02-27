import type { Selection } from '@forge/shared';
import type { CharacterDoc, RelationshipDoc } from '@/lib/domains/character/types';
import { resolveRelId } from '@/lib/domains/character/operations';

export interface InspectorSection {
  id: string;
  title: string;
  when: (selection: Selection) => boolean;
  render: (selection: Selection) => string; // serialisable summary for the inspector
}

interface Deps {
  characters: CharacterDoc[];
  relationships: RelationshipDoc[];
}

export function characterInspectorSections(deps: Deps): InspectorSection[] {
  const { characters, relationships } = deps;

  return [
    {
      id: 'character-details',
      title: 'Character',
      when: (sel) => sel.type === 'entity' && sel.entityType === 'character.node',
      render: (sel) => {
        if (sel.type !== 'entity') return '';
        const char = characters.find((c) => c.id === Number(sel.id));
        if (!char) return `Character #${sel.id} not found.`;
        return `Name: ${char.name}\nDescription: ${char.description ?? '(none)'}\nImage: ${char.imageUrl ? 'Yes' : 'None'}`;
      },
    },
    {
      id: 'relationship-details',
      title: 'Relationship',
      when: (sel) => sel.type === 'entity' && sel.entityType === 'character.relationship',
      render: (sel) => {
        if (sel.type !== 'entity') return '';
        const rel = relationships.find((r) => r.id === Number(sel.id));
        if (!rel) return `Relationship #${sel.id} not found.`;
        const srcId = resolveRelId(rel.sourceCharacter);
        const tgtId = resolveRelId(rel.targetCharacter);
        const src = characters.find((c) => c.id === srcId);
        const tgt = characters.find((c) => c.id === tgtId);
        return `${src?.name ?? srcId} — ${rel.label} — ${tgt?.name ?? tgtId}\n${rel.description ?? ''}`;
      },
    },
  ];
}

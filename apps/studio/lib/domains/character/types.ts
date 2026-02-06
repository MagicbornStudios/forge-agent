/**
 * Character workspace UI types.
 * Re-exports domain types from @forge/types/character and adds UI-specific shapes.
 */

export type {
  CharacterDoc,
  RelationshipDoc,
  CharacterPatchOp,
} from '@forge/types/character';

export { CHARACTER_PATCH_OP } from '@forge/types/character';

/** Data payload for CharacterCardNode in React Flow. */
export interface CharacterCardNodeData {
  characterId: number;
  name: string;
  subtitle?: string;
  imageUrl?: string | null;
  initials: string;
  isActive: boolean;
}

/** Data payload for RelationshipEdge in React Flow. */
export interface RelationshipEdgeData {
  relationshipId: number;
  label: string;
  description?: string | null;
}

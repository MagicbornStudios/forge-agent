/**
 * Character domain types.
 *
 * CharacterDoc and RelationshipDoc are lightweight wrappers over Payload
 * records so the rest of the app never needs to import generated types
 * directly.
 */

// ---------------------------------------------------------------------------
// Document shapes (mirrors Payload collection records)
// ---------------------------------------------------------------------------

export interface CharacterDoc {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  voiceId?: string | null;
  avatar?: number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string }; medium?: { url?: string } } } | null;
  project: number | { id: number };
  meta?: Record<string, unknown> | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipDoc {
  id: number;
  project: number | { id: number };
  sourceCharacter: number | CharacterDoc;
  targetCharacter: number | CharacterDoc;
  label: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Patch operations (used by copilot actions & store)
// ---------------------------------------------------------------------------

export const CHARACTER_PATCH_OP = {
  CREATE_CHARACTER: 'createCharacter',
  UPDATE_CHARACTER: 'updateCharacter',
  DELETE_CHARACTER: 'deleteCharacter',
  CREATE_RELATIONSHIP: 'createRelationship',
  UPDATE_RELATIONSHIP: 'updateRelationship',
  DELETE_RELATIONSHIP: 'deleteRelationship',
  SET_ACTIVE_CHARACTER: 'setActiveCharacter',
} as const;

export type CharacterPatchOp =
  | {
      type: typeof CHARACTER_PATCH_OP.CREATE_CHARACTER;
      name: string;
      description?: string;
      imageUrl?: string;
      voiceId?: string;
      projectId: number;
    }
  | {
      type: typeof CHARACTER_PATCH_OP.UPDATE_CHARACTER;
      characterId: number;
      updates: Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl' | 'voiceId'>>;
    }
  | {
      type: typeof CHARACTER_PATCH_OP.DELETE_CHARACTER;
      characterId: number;
    }
  | {
      type: typeof CHARACTER_PATCH_OP.CREATE_RELATIONSHIP;
      sourceCharacterId: number;
      targetCharacterId: number;
      label: string;
      description?: string;
      projectId: number;
    }
  | {
      type: typeof CHARACTER_PATCH_OP.UPDATE_RELATIONSHIP;
      relationshipId: number;
      updates: Partial<Pick<RelationshipDoc, 'label' | 'description'>>;
    }
  | {
      type: typeof CHARACTER_PATCH_OP.DELETE_RELATIONSHIP;
      relationshipId: number;
    }
  | {
      type: typeof CHARACTER_PATCH_OP.SET_ACTIVE_CHARACTER;
      characterId: number | null;
    };

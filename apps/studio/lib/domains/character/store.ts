'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CharacterDoc, RelationshipDoc } from './types';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface CharacterStore {
  /** Active project providing the character set. */
  projectId: number | null;
  /** Characters loaded for the active project. */
  characters: CharacterDoc[];
  /** Relationships loaded for the active project. */
  relationships: RelationshipDoc[];
  /** Currently focused character (centre of graph). */
  activeCharacterId: number | null;
  /** True when local state differs from the server. */
  isDirty: boolean;

  // -- Actions ---------------------------------------------------------------
  setProject: (projectId: number | null) => void;
  setCharacters: (chars: CharacterDoc[]) => void;
  setRelationships: (rels: RelationshipDoc[]) => void;
  setActiveCharacter: (id: number | null) => void;
  addCharacter: (char: CharacterDoc) => void;
  updateCharacterLocal: (id: number, updates: Partial<CharacterDoc>) => void;
  removeCharacter: (id: number) => void;
  addRelationship: (rel: RelationshipDoc) => void;
  updateRelationshipLocal: (id: number, updates: Partial<RelationshipDoc>) => void;
  removeRelationship: (id: number) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const CHARACTER_DRAFT_KEY = 'forge:character-draft:v1';

export const useCharacterStore = create<CharacterStore>()(
  devtools(
    persist(
      immer((set) => ({
        projectId: null,
        characters: [],
        relationships: [],
        activeCharacterId: null,
        isDirty: false,

        setProject: (projectId) => {
          set((s) => {
            s.projectId = projectId;
            // Reset workspace state when switching projects.
            s.characters = [];
            s.relationships = [];
            s.activeCharacterId = null;
            s.isDirty = false;
          });
        },

        setCharacters: (chars) => {
          set((s) => {
            s.characters = chars;
          });
        },

        setRelationships: (rels) => {
          set((s) => {
            s.relationships = rels;
          });
        },

        setActiveCharacter: (id) => {
          set((s) => {
            s.activeCharacterId = id;
          });
        },

        addCharacter: (char) => {
          set((s) => {
            s.characters.push(char);
          });
        },

        updateCharacterLocal: (id, updates) => {
          set((s) => {
            const idx = s.characters.findIndex((c) => c.id === id);
            if (idx !== -1) {
              Object.assign(s.characters[idx], updates);
              s.isDirty = true;
            }
          });
        },

        removeCharacter: (id) => {
          set((s) => {
            s.characters = s.characters.filter((c) => c.id !== id);
            if (s.activeCharacterId === id) s.activeCharacterId = null;
            // Also remove relationships referencing this character.
            s.relationships = s.relationships.filter((r) => {
              const src = typeof r.sourceCharacter === 'number' ? r.sourceCharacter : r.sourceCharacter.id;
              const tgt = typeof r.targetCharacter === 'number' ? r.targetCharacter : r.targetCharacter.id;
              return src !== id && tgt !== id;
            });
          });
        },

        addRelationship: (rel) => {
          set((s) => {
            s.relationships.push(rel);
          });
        },

        updateRelationshipLocal: (id, updates) => {
          set((s) => {
            const idx = s.relationships.findIndex((r) => r.id === id);
            if (idx !== -1) {
              Object.assign(s.relationships[idx], updates);
              s.isDirty = true;
            }
          });
        },

        removeRelationship: (id) => {
          set((s) => {
            s.relationships = s.relationships.filter((r) => r.id !== id);
          });
        },
      })),
      {
        name: CHARACTER_DRAFT_KEY,
        partialize: (s) =>
          s.projectId
            ? { projectId: s.projectId, activeCharacterId: s.activeCharacterId }
            : {},
        skipHydration: true,
      },
    ),
    { name: 'Character' },
  ),
);

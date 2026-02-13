/**
 * Mock data for docs playgrounds. Derived from payload/seed.ts shapes.
 * Use when rendering editors in docs without a backend.
 *
 * When seed changes, update this file to stay in sync.
 * See docs/mock-from-seed.md for sync notes.
 */

import type { ForgeReactFlowJson } from '@forge/types/graph';
import type { CharacterDoc, RelationshipDoc } from '@forge/types/character';

/** Stable IDs for mock data (match seed output where possible). */
export const MOCK_PROJECT_ID = 1;
export const MOCK_NARRATIVE_GRAPH_ID = 1;
export const MOCK_STORYLET_GRAPH_ID = 2;
export const MOCK_CHARACTER_1_ID = 1;
export const MOCK_CHARACTER_2_ID = 2;
export const MOCK_RELATIONSHIP_ID = 1;

/** Demo flow shape from seed.ts demoFlow */
const DEMO_FLOW: ForgeReactFlowJson = {
  nodes: [
    {
      id: 'start',
      type: 'CHARACTER',
      position: { x: 0, y: 0 },
      data: {
        label: 'Start',
        speaker: 'Narrator',
        content: 'Welcome to Forge.',
      },
    },
  ],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

/** Mock project (matches seed ensureProject output). */
export const MOCK_PROJECT = {
  id: MOCK_PROJECT_ID,
  title: 'Demo Project',
  slug: 'demo-project',
  description: 'Seeded demo project for Forge.',
  domain: 'forge' as const,
  status: 'active' as const,
  estimatedSizeBytes: 0,
  forgeGraph: MOCK_NARRATIVE_GRAPH_ID,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

/** Mock narrative forge graph. */
export const MOCK_FORGE_GRAPH_NARRATIVE = {
  id: MOCK_NARRATIVE_GRAPH_ID,
  project: MOCK_PROJECT_ID,
  kind: 'NARRATIVE' as const,
  title: 'Demo Narrative',
  flow: DEMO_FLOW,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

/** Mock storylet forge graph. */
export const MOCK_FORGE_GRAPH_STORYLET = {
  id: MOCK_STORYLET_GRAPH_ID,
  project: MOCK_PROJECT_ID,
  kind: 'STORYLET' as const,
  title: 'Demo Storylet',
  flow: DEMO_FLOW,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

/** Mock characters for CharacterEditor docs. */
export const MOCK_CHARACTERS: CharacterDoc[] = [
  {
    id: MOCK_CHARACTER_1_ID,
    name: 'Demo Hero',
    description: 'The main character.',
    imageUrl: null,
    voiceId: null,
    project: MOCK_PROJECT_ID,
    meta: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: MOCK_CHARACTER_2_ID,
    name: 'Sidekick',
    description: 'Supporting character.',
    imageUrl: null,
    voiceId: null,
    project: MOCK_PROJECT_ID,
    meta: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/** Mock relationship. */
export const MOCK_RELATIONSHIPS: RelationshipDoc[] = [
  {
    id: MOCK_RELATIONSHIP_ID,
    project: MOCK_PROJECT_ID,
    sourceCharacter: MOCK_CHARACTERS[0],
    targetCharacter: MOCK_CHARACTERS[1],
    label: 'knows',
    description: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/** All mock forge graphs for DialogueEditor. */
export const MOCK_FORGE_GRAPHS = [
  MOCK_FORGE_GRAPH_NARRATIVE,
  MOCK_FORGE_GRAPH_STORYLET,
];

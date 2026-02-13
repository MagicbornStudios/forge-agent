'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { EditorId } from '@/lib/app-shell/store';
import {
  MOCK_PROJECT_ID,
  MOCK_PROJECT,
  MOCK_FORGE_GRAPHS,
  MOCK_CHARACTERS,
  MOCK_RELATIONSHIPS,
} from '@/lib/docs/mock-data';

export interface DocsMockContextValue {
  activeProjectId: number | null;
  activeEditorId: EditorId;
  forgeGraphs: typeof MOCK_FORGE_GRAPHS;
  characters: typeof MOCK_CHARACTERS;
  relationships: typeof MOCK_RELATIONSHIPS;
  project: (typeof MOCK_PROJECT) | null;
}

const DocsMockContext = createContext<DocsMockContextValue | null>(null);

export function useDocsMock(): DocsMockContextValue | null {
  return useContext(DocsMockContext);
}

export interface DocsMockProviderProps {
  children: React.ReactNode;
  activeProjectId?: number | null;
  activeEditorId?: EditorId;
}

/**
 * Provides mock data for docs playgrounds. Use when rendering editors
 * in docs without AppProviders/backend. Consumers can use useDocsMock()
 * to read mock state; editor components would need to branch on
 * "docs mode" to use this instead of real hooks.
 */
export function DocsMockProvider({
  children,
  activeProjectId = MOCK_PROJECT_ID,
  activeEditorId = 'dialogue',
}: DocsMockProviderProps) {
  const value = useMemo<DocsMockContextValue>(
    () => ({
      activeProjectId,
      activeEditorId,
      forgeGraphs: MOCK_FORGE_GRAPHS,
      characters: MOCK_CHARACTERS,
      relationships: MOCK_RELATIONSHIPS,
      project: activeProjectId === MOCK_PROJECT_ID ? MOCK_PROJECT : null,
    }),
    [activeProjectId, activeEditorId]
  );

  return (
    <DocsMockContext.Provider value={value}>
      {children}
    </DocsMockContext.Provider>
  );
}

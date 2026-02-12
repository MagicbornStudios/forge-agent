'use client';

import * as React from 'react';
import { PanelRegistrationContextProvider } from '@forge/shared/components/editor';

export interface EditorLayoutProviderProps {
  /** Editor id (e.g. dialogue, character). Used for visibility keys and menu scope. */
  editorId: string;
  /** Optional viewport id for settings context (e.g. narrative, storylet). */
  viewportId?: string | null;
  /** Optional project id for settings context. */
  projectId?: string | null;
  children: React.ReactNode;
}

/**
 * Provides editor context (editorId) for EditorMenubarContribution and other editor-scoped components.
 * Must wrap editor layout and menubar contribution.
 */
export function EditorLayoutProvider({
  editorId,
  viewportId,
  projectId,
  children,
}: EditorLayoutProviderProps) {
  const value = React.useMemo(() => ({ editorId }), [editorId]);

  return (
    <PanelRegistrationContextProvider value={value}>
      {children}
    </PanelRegistrationContextProvider>
  );
}

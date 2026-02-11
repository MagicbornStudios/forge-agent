'use client';

import * as React from 'react';
import {
  PanelRegistrationContextProvider,
  type RailSide,
  type RailPanelDescriptor,
} from '@forge/shared/components/editor';
import { usePanelRegistryStore } from '@/lib/editor-registry/panel-registry';

export interface EditorLayoutProviderProps {
  /** Editor id (e.g. dialogue, character). Used for panel registry and visibility keys. */
  editorId: string;
  /** Optional viewport id for settings context (e.g. narrative, storylet). */
  viewportId?: string | null;
  /** Optional project id for settings context. */
  projectId?: string | null;
  children: React.ReactNode;
}

/**
 * Provides panel registration context for EditorRail/EditorPanel. Clears any existing
 * panels for this editor on mount so switching editors resets the layout registry.
 * Must wrap EditorRail(s) and EditorLayout.
 */
export function EditorLayoutProvider({
  editorId,
  viewportId,
  projectId,
  children,
}: EditorLayoutProviderProps) {
  const clearEditor = usePanelRegistryStore((s) => s.clearEditor);
  const setRailPanels = usePanelRegistryStore((s) => s.setRailPanels);

  React.useEffect(() => {
    clearEditor(editorId);
    return () => clearEditor(editorId);
  }, [editorId, clearEditor]);

  const value = React.useMemo(
    () => ({
      editorId,
      setRailPanels: (side: RailSide, descriptors: RailPanelDescriptor[]) =>
        setRailPanels(editorId, side, descriptors),
    }),
    [editorId, setRailPanels],
  );

  return (
    <PanelRegistrationContextProvider value={value}>
      {children}
    </PanelRegistrationContextProvider>
  );
}

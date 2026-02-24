'use client';

import * as React from 'react';
import { PanelRegistrationContextProvider } from '@forge/shared/components/editor';

export interface WorkspaceContextProviderProps {
  /** Workspace id (e.g. dialogue, character). Used for visibility keys and menu scope. */
  workspaceId: string;
  /** Optional viewport id for settings context (e.g. narrative, storylet). */
  viewportId?: string | null;
  /** Optional project id for settings context. */
  projectId?: string | null;
  children: React.ReactNode;
}

/**
 * Provides workspace context (workspaceId) for WorkspaceMenubarContribution and other workspace-scoped components.
 * Must wrap workspace layout and menubar contribution.
 */
export function WorkspaceContextProvider({
  workspaceId,
  viewportId,
  projectId,
  children,
}: WorkspaceContextProviderProps) {
  const value = React.useMemo(() => ({ workspaceId }), [workspaceId]);

  return (
    <PanelRegistrationContextProvider value={value}>
      {children}
    </PanelRegistrationContextProvider>
  );
}

'use client';

import * as React from 'react';
import { SettingsRegistrationContextProvider } from '@/lib/workspace-registry/SettingsRegistrationContext';

export interface ViewportSettingsProviderProps {
  workspaceId: string;
  viewportId: string;
  children: React.ReactNode;
}

/**
 * Provides settings registration context for scope "viewport" with
 * scopeId `${workspaceId}:${viewportId}`. SettingsSection components under
 * this provider register for that viewport (e.g. graph-viewport for Dialogue).
 */
export function ViewportSettingsProvider({
  workspaceId,
  viewportId,
  children,
}: ViewportSettingsProviderProps) {
  const value = React.useMemo(
    () => ({ scope: 'viewport' as const, scopeId: `${workspaceId}:${viewportId}` }),
    [workspaceId, viewportId],
  );
  return (
    <SettingsRegistrationContextProvider value={value}>
      {children}
    </SettingsRegistrationContextProvider>
  );
}

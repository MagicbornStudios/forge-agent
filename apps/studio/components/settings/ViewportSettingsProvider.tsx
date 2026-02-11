'use client';

import * as React from 'react';
import { SettingsRegistrationContextProvider } from '@/lib/editor-registry/SettingsRegistrationContext';

export interface ViewportSettingsProviderProps {
  editorId: string;
  viewportId: string;
  children: React.ReactNode;
}

/**
 * Provides settings registration context for scope "viewport" with
 * scopeId `${editorId}:${viewportId}`. SettingsSection components under
 * this provider register for that viewport (e.g. graph-viewport for Dialogue).
 */
export function ViewportSettingsProvider({
  editorId,
  viewportId,
  children,
}: ViewportSettingsProviderProps) {
  const value = React.useMemo(
    () => ({ scope: 'viewport' as const, scopeId: `${editorId}:${viewportId}` }),
    [editorId, viewportId],
  );
  return (
    <SettingsRegistrationContextProvider value={value}>
      {children}
    </SettingsRegistrationContextProvider>
  );
}

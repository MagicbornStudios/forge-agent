'use client';

import * as React from 'react';
import {
  SettingsRegistrationContextProvider,
} from '@/lib/workspace-registry/SettingsRegistrationContext';

export interface AppSettingsProviderProps {
  children: React.ReactNode;
}

/**
 * Provides settings registration context for scope "app". SettingsSection
 * components under this provider register with scope app and scopeId null.
 */
export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const value = React.useMemo(
    () => ({ scope: 'app' as const, scopeId: null }),
    [],
  );
  return (
    <SettingsRegistrationContextProvider value={value}>
      {children}
    </SettingsRegistrationContextProvider>
  );
}

/** Alias for AppSettingsProvider; Studio owns the settings sidebar and app-scoped registration. */
export const StudioSettingsProvider = AppSettingsProvider;

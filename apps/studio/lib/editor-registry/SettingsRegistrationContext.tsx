'use client';

import * as React from 'react';
import type { SettingsScope } from './settings-registry';

export interface SettingsRegistrationContextValue {
  scope: SettingsScope;
  scopeId: string | null;
}

const SettingsRegistrationContext = React.createContext<SettingsRegistrationContextValue | null>(null);

export function useSettingsRegistration(): SettingsRegistrationContextValue {
  const ctx = React.useContext(SettingsRegistrationContext);
  if (ctx == null) {
    throw new Error('SettingsSection must be used within AppSettingsProvider or ViewportSettingsProvider');
  }
  return ctx;
}

export const SettingsRegistrationContextProvider = SettingsRegistrationContext.Provider;

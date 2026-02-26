'use client';

import * as React from 'react';

export type SettingsTriggerContextValue = {
  openSettings?: () => void;
};

const SettingsTriggerContext = React.createContext<SettingsTriggerContextValue | null>(null);

export function useSettingsTrigger(): SettingsTriggerContextValue | null {
  return React.useContext(SettingsTriggerContext);
}

export interface SettingsTriggerProviderProps {
  openSettings?: () => void;
  children: React.ReactNode;
}

/**
 * Provides openSettings to WorkspaceSettingsTrigger. Use in your app shell (e.g. alongside
 * your settings drawer state) so the trigger opens the drawer.
 */
export function SettingsTriggerProvider({ openSettings, children }: SettingsTriggerProviderProps) {
  const value = React.useMemo<SettingsTriggerContextValue>(
    () => ({ openSettings }),
    [openSettings],
  );
  return (
    <SettingsTriggerContext.Provider value={value}>
      {children}
    </SettingsTriggerContext.Provider>
  );
}

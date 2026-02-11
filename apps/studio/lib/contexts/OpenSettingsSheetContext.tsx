'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { SettingsTriggerProvider } from '@forge/shared';
import { useAppShellStore } from '@/lib/app-shell/store';

type OpenSettingsSheetContextValue = {
  openAppSettingsSheet: () => void;
};

const OpenSettingsSheetContext = createContext<OpenSettingsSheetContextValue | null>(null);

function openAppSettingsSheetFromStore(): void {
  // Defer so Radix menubar can close first when opened from menu.
  // Open the universal Settings Sidebar (right rail).
  setTimeout(() => useAppShellStore.getState().setSettingsSidebarOpen(true), 0);
}

export function OpenSettingsSheetProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<OpenSettingsSheetContextValue>(
    () => ({ openAppSettingsSheet: openAppSettingsSheetFromStore }),
    []
  );
  return (
    <OpenSettingsSheetContext.Provider value={value}>
      <SettingsTriggerProvider openSettings={openAppSettingsSheetFromStore}>
        {children}
      </SettingsTriggerProvider>
    </OpenSettingsSheetContext.Provider>
  );
}

export function useOpenSettingsSheet(): () => void {
  const ctx = useContext(OpenSettingsSheetContext);
  if (ctx == null) {
    throw new Error('useOpenSettingsSheet must be used within OpenSettingsSheetProvider');
  }
  return ctx.openAppSettingsSheet;
}

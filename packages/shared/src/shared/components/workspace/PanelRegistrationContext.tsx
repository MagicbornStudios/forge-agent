'use client';

import * as React from 'react';

export type RailSide = 'left' | 'main' | 'right' | 'bottom';

export interface PanelRegistrationContextValue {
  workspaceId: string;
}

const PanelRegistrationContext = React.createContext<PanelRegistrationContextValue | null>(null);

export function usePanelRegistration(): PanelRegistrationContextValue {
  const ctx = React.useContext(PanelRegistrationContext);
  if (ctx == null) {
    throw new Error('Must be used within WorkspaceContextProvider');
  }
  return ctx;
}

export const PanelRegistrationContextProvider = PanelRegistrationContext.Provider;

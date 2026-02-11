'use client';

import * as React from 'react';
import type { RailPanelDescriptor } from './DockLayout';
import type { DockLayoutSlotIconKey } from './DockviewSlotTab';

export type RailSide = 'left' | 'main' | 'right' | 'bottom';

export interface PanelRegistrationContextValue {
  editorId: string;
  setRailPanels: (side: RailSide, descriptors: RailPanelDescriptor[]) => void;
}

const PanelRegistrationContext = React.createContext<PanelRegistrationContextValue | null>(null);

export function usePanelRegistration(): PanelRegistrationContextValue {
  const ctx = React.useContext(PanelRegistrationContext);
  if (ctx == null) {
    throw new Error('EditorRail and EditorPanel must be used within EditorLayoutProvider');
  }
  return ctx;
}

export const PanelRegistrationContextProvider = PanelRegistrationContext.Provider;

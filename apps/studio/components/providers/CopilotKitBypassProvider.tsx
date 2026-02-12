'use client';

import React, { createContext, useContext } from 'react';

/** Legacy sidebar state; kept for compatibility. No CopilotKit. */
export const CopilotSidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export function useCopilotSidebar() {
  const context = useContext(CopilotSidebarContext);
  if (!context) {
    throw new Error('useCopilotSidebar must be used within CopilotKitBypassProvider');
  }
  return context;
}

const BYPASS_VALUE = { isOpen: false, setIsOpen: () => {} } as const;

/** Supplies CopilotSidebarContext only (no CopilotKit). Assistant UI is the chat surface. */
export function CopilotKitBypassProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotSidebarContext.Provider value={BYPASS_VALUE}>
      {children}
    </CopilotSidebarContext.Provider>
  );
}

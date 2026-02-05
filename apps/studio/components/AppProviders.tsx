'use client';

import React from 'react';
import { CopilotKitProvider } from '@/components/providers/CopilotKitProvider';
import { TooltipProvider } from '@/components/providers/TooltipProvider';
import { EntitlementsProvider } from '@/components/providers/EntitlementsProvider';
import { AppShellPersistGate } from '@/components/persistence/AppShellPersistGate';
import { DirtyBeforeUnload } from '@/components/persistence/DirtyBeforeUnload';

export interface AppProvidersProps {
  children: React.ReactNode;
  copilotDefaultOpen?: boolean;
}

export function AppProviders({ children, copilotDefaultOpen = true }: AppProvidersProps) {
  return (
    <AppShellPersistGate>
      <DirtyBeforeUnload />
      <EntitlementsProvider>
        <TooltipProvider>
          <CopilotKitProvider defaultOpen={copilotDefaultOpen}>
            {children}
          </CopilotKitProvider>
        </TooltipProvider>
      </EntitlementsProvider>
    </AppShellPersistGate>
  );
}

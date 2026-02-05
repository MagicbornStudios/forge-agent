'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export interface ForgeCopilotProviderLabels {
  title?: string;
  initial?: string;
}

export interface ForgeCopilotProviderProps {
  children: React.ReactNode;
  runtimeUrl?: string;
  publicApiKey?: string;
  instructions?: string;
  labels?: ForgeCopilotProviderLabels;
  headers?: Record<string, string>;
  forwardedParameters?: Record<string, unknown>;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ForgeCopilotSidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export function useForgeCopilotSidebar() {
  const context = useContext(ForgeCopilotSidebarContext);
  if (!context) {
    throw new Error('useForgeCopilotSidebar must be used within ForgeCopilotProvider');
  }
  return context;
}

export function ForgeCopilotProvider({
  children,
  runtimeUrl = '/api/copilotkit',
  publicApiKey,
  instructions,
  labels,
  headers,
  forwardedParameters,
  defaultOpen = true,
  open,
  onOpenChange,
}: ForgeCopilotProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  useEffect(() => {
    if (typeof open === 'boolean') {
      setInternalOpen(open);
    }
  }, [open]);

  const isOpen = typeof open === 'boolean' ? open : internalOpen;
  const setIsOpen = (next: boolean) => {
    if (typeof open !== 'boolean') {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const sidebarLabels = useMemo(() => ({
    title: labels?.title ?? 'AI Assistant',
    initial: labels?.initial ?? 'Ask the assistant to help with your workspace.',
  }), [labels]);

  const finalInstructions =
    instructions && instructions.trim().length > 0
      ? instructions
      : 'You are an AI assistant for a creative workspace. Use the available actions to help users edit their project.';

  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      headers={headers}
      forwardedParameters={forwardedParameters}
      {...(publicApiKey ? { publicApiKey } : {})}
    >
      <ForgeCopilotSidebarContext.Provider value={{ isOpen, setIsOpen }}>
        <CopilotSidebar
          instructions={finalInstructions}
          defaultOpen={isOpen}
          labels={sidebarLabels}
          onSetOpen={setIsOpen}
        >
          {children}
        </CopilotSidebar>
      </ForgeCopilotSidebarContext.Provider>
    </CopilotKit>
  );
}

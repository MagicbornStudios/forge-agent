'use client';

import * as React from 'react';
import { TooltipProvider as RadixTooltipProvider } from '@forge/ui/tooltip';
import { ForgeCopilotProvider, type ForgeCopilotProviderProps } from '../../copilot/next';

export interface AppProvidersProps {
  children: React.ReactNode;
  /** Enable/disable the tooltip provider or pass its props. */
  tooltip?: false | { delayDuration?: number; skipDelayDuration?: number };
  /**
   * Configure the Copilot provider. Pass `false` to disable.
   * When enabled, this uses ForgeCopilotProvider (Next-only).
   */
  copilot?: false | ForgeCopilotProviderProps;
  /**
   * Additional providers to wrap around the stack.
   * The first provider in the array becomes the outermost wrapper.
   */
  providers?: Array<React.ComponentType<{ children: React.ReactNode }>>;
}

export function AppProviders({
  children,
  tooltip = {},
  copilot,
  providers = [],
}: AppProvidersProps) {
  let content = children;

  if (copilot !== false && copilot) {
    content = <ForgeCopilotProvider {...copilot}>{content}</ForgeCopilotProvider>;
  }

  if (tooltip !== false) {
    const { delayDuration, skipDelayDuration } = tooltip ?? {};
    content = (
      <RadixTooltipProvider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
        {content}
      </RadixTooltipProvider>
    );
  }

  if (providers.length > 0) {
    content = providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, content);
  }

  return <>{content}</>;
}

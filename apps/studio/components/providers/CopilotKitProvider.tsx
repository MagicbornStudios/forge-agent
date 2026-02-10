'use client';

import React, { useMemo, useState, createContext, useContext } from 'react';
import { useAppShellStore } from '@/lib/app-shell/store';
import { EDITOR_VIEWPORT_IDS, EDITOR_LABELS } from '@/lib/app-shell/editor-metadata';
import { API_ROUTES } from '@/lib/api-client/routes';
import { useSettingsStore } from '@/lib/settings/store';
import { CopilotChatInput } from '@/components/copilot/CopilotChatInput';
import { CAPABILITIES, useEntitlements } from '@forge/shared/entitlements';
import { ForgeCopilotProvider } from '@forge/shared/copilot/next';

interface CopilotKitProviderProps {
  children: React.ReactNode;
  /** Base instructions. Domain-specific instructions are layered via contracts. */
  instructions?: string;
  defaultOpen?: boolean;
  /** Sidebar labels (domain workspaces can customise these). */
  labels?: { title?: string; initial?: string };
}

const CopilotSidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export function useCopilotSidebar() {
  const context = useContext(CopilotSidebarContext);
  if (!context) {
    throw new Error('useCopilotSidebar must be used within CopilotKitProvider');
  }
  return context;
}

/**
 * Generic CopilotKit provider that can be used by any editor.
 * Context and actions are provided by system-specific contracts
 * (via `useDomainCopilot` inside editor components).
 * Model selection is server-state only; use ModelSwitcher (provider="copilot") to change it.
 */
export function CopilotKitProvider({
  children,
  instructions,
  defaultOpen = false,
  labels,
}: CopilotKitProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const activeWorkspaceId = useAppShellStore((s) => s.route.activeWorkspaceId);
  const viewportId = EDITOR_VIEWPORT_IDS[activeWorkspaceId];
  const ids = useMemo(
    () => ({ editorId: activeWorkspaceId, viewportId }),
    [activeWorkspaceId, viewportId],
  );
  const agentNameRaw = useSettingsStore((s) => s.getSettingValue('ai.agentName', ids));
  const instructionsRaw = useSettingsStore((s) => s.getSettingValue('ai.instructions', ids));
  const toolsEnabledRaw = useSettingsStore((s) => s.getSettingValue('ai.toolsEnabled', ids));
  const temperatureRaw = useSettingsStore((s) => s.getSettingValue('ai.temperature', ids));

  const entitlements = useEntitlements();

  const publicApiKey = process.env.NEXT_PUBLIC_COPILOTKIT_API_KEY;
  const agentName =
    typeof agentNameRaw === 'string' ? agentNameRaw : 'AI Assistant';
  const settingsInstructions =
    typeof instructionsRaw === 'string' ? instructionsRaw : '';
  const toolsEnabled =
    toolsEnabledRaw !== false && entitlements.has(CAPABILITIES.STUDIO_AI_TOOLS);
  const temperature =
    typeof temperatureRaw === 'number' ? temperatureRaw : Number(temperatureRaw);

  const finalInstructions = (instructions ?? settingsInstructions).trim()
    ? (instructions ?? settingsInstructions)
    : 'You are an AI assistant for a creative editor. Use the available actions to help users edit their project.';
  const sidebarTitle = labels?.title ?? agentName ?? 'AI Assistant';
  const sidebarInitial =
    labels?.initial ??
    `Ask ${agentName ?? 'the assistant'} to help with ${EDITOR_LABELS[activeWorkspaceId]}.`;
  const forwardedParameters = useMemo(() => {
    if (!Number.isFinite(temperature)) return undefined;
    return { temperature };
  }, [temperature]);
  const headers = useMemo(
    () => {
      const next: Record<string, string> = {
        'x-forge-workspace-id': activeWorkspaceId,
        'x-forge-workspace-name': EDITOR_LABELS[activeWorkspaceId],
        'x-forge-editor-id': activeWorkspaceId,
        'x-forge-tools-enabled': toolsEnabled ? 'true' : 'false',
      };
      if (viewportId) {
        next['x-forge-viewport-id'] = viewportId;
      }
      if (agentName) {
        next['x-forge-agent-name'] = agentName;
      }
      return next;
    },
    [activeWorkspaceId, agentName, viewportId, toolsEnabled],
  );

  return (
    <ForgeCopilotProvider
      runtimeUrl={API_ROUTES.COPILOTKIT}
      headers={headers}
      forwardedParameters={forwardedParameters}
      publicApiKey={publicApiKey}
      instructions={finalInstructions}
      labels={{
        title: sidebarTitle,
        initial: sidebarInitial,
      }}
      chatInput={CopilotChatInput}
      imageUploadsEnabled={true}
      open={activeWorkspaceId === 'strategy' ? false : isOpen}
      onOpenChange={setIsOpen}
    >
      <CopilotSidebarContext.Provider value={{ isOpen, setIsOpen }}>
        {children}
      </CopilotSidebarContext.Provider>
    </ForgeCopilotProvider>
  );
}

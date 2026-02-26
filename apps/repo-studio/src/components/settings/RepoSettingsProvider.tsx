'use client';

import * as React from 'react';
import type { RepoEditorPanelSpec } from '@/lib/app-shell/editor-panels';
import type { RepoAuthStatusResponse } from '@/lib/api/types';

type RepoSettingsMode = 'local' | 'preview' | 'production' | 'headless';

type RepoSettingsContextValue = {
  profile: string;
  mode: RepoSettingsMode;
  confirmRuns: boolean;
  reviewQueueTrustMode: 'require-approval' | 'auto-approve-all';
  reviewQueueLastAutoApplyAt: string;
  activeLoopId: string;
  forgeAssistantPrompt: string;
  codexAssistantPrompt: string;
  platformBaseUrl: string;
  platformAutoValidate: boolean;
  platformStatus: RepoAuthStatusResponse | null;
  platformBusy: boolean;
  panelSpecs: RepoEditorPanelSpec[];
  panelVisibility: Record<string, boolean>;
  onSetPanelVisible: (panelId: string, visible: boolean) => void;
  onRestorePanels: () => void;
  onStopRuntime: () => void;
  onPlatformConnect: (input: { baseUrl: string; token: string }) => Promise<void>;
  onPlatformValidate: (input?: { baseUrl?: string; token?: string }) => Promise<void>;
  onPlatformDisconnect: () => Promise<void>;
  getFieldValue: (key: string) => string | boolean;
  setFieldValue: (key: string, value: string | boolean) => void;
};

const RepoSettingsContext = React.createContext<RepoSettingsContextValue | null>(null);

export interface RepoSettingsProviderProps {
  profile: string;
  mode: RepoSettingsMode;
  confirmRuns: boolean;
  reviewQueueTrustMode: 'require-approval' | 'auto-approve-all';
  reviewQueueLastAutoApplyAt: string;
  activeLoopId: string;
  forgeAssistantPrompt: string;
  codexAssistantPrompt: string;
  platformBaseUrl: string;
  platformAutoValidate: boolean;
  platformStatus: RepoAuthStatusResponse | null;
  platformBusy: boolean;
  panelSpecs: RepoEditorPanelSpec[];
  panelVisibility: Record<string, boolean>;
  onProfileChange: (value: string) => void;
  onModeChange: (value: RepoSettingsMode) => void;
  onConfirmRunsChange: (value: boolean) => void;
  onReviewQueueTrustModeChange: (value: 'require-approval' | 'auto-approve-all') => void;
  onForgeAssistantPromptChange: (value: string) => void;
  onCodexAssistantPromptChange: (value: string) => void;
  onPlatformBaseUrlChange: (value: string) => void;
  onPlatformAutoValidateChange: (value: boolean) => void;
  onSetPanelVisible: (panelId: string, visible: boolean) => void;
  onRestorePanels: () => void;
  onStopRuntime: () => void;
  onPlatformConnect: (input: { baseUrl: string; token: string }) => Promise<void>;
  onPlatformValidate: (input?: { baseUrl?: string; token?: string }) => Promise<void>;
  onPlatformDisconnect: () => Promise<void>;
  children: React.ReactNode;
}

export function RepoSettingsProvider({
  profile,
  mode,
  confirmRuns,
  reviewQueueTrustMode,
  reviewQueueLastAutoApplyAt,
  activeLoopId,
  forgeAssistantPrompt,
  codexAssistantPrompt,
  platformBaseUrl,
  platformAutoValidate,
  platformStatus,
  platformBusy,
  panelSpecs,
  panelVisibility,
  onProfileChange,
  onModeChange,
  onConfirmRunsChange,
  onReviewQueueTrustModeChange,
  onForgeAssistantPromptChange,
  onCodexAssistantPromptChange,
  onPlatformBaseUrlChange,
  onPlatformAutoValidateChange,
  onSetPanelVisible,
  onRestorePanels,
  onStopRuntime,
  onPlatformConnect,
  onPlatformValidate,
  onPlatformDisconnect,
  children,
}: RepoSettingsProviderProps) {
  const value = React.useMemo<RepoSettingsContextValue>(() => ({
    profile,
    mode,
    confirmRuns,
    reviewQueueTrustMode,
    reviewQueueLastAutoApplyAt,
    activeLoopId,
    forgeAssistantPrompt,
    codexAssistantPrompt,
    platformBaseUrl,
    platformAutoValidate,
    platformStatus,
    platformBusy,
    panelSpecs,
    panelVisibility,
    onSetPanelVisible,
    onRestorePanels,
    onStopRuntime,
    onPlatformConnect,
    onPlatformValidate,
    onPlatformDisconnect,
    getFieldValue: (key: string) => {
      if (key === 'env.profile') return profile;
      if (key === 'env.mode') return mode;
      if (key === 'commands.confirmRuns') return confirmRuns;
      if (key === 'reviewQueue.trustMode') return reviewQueueTrustMode;
      if (key === 'reviewQueue.autoApplyEnabled') return reviewQueueTrustMode === 'auto-approve-all';
      if (key === 'reviewQueue.lastAutoApplyAt') return reviewQueueLastAutoApplyAt;
      if (key === 'platform.baseUrl') return platformBaseUrl;
      if (key === 'platform.autoValidate') return platformAutoValidate;
      if (key === 'platform.lastStatus') return platformStatus?.connected ? 'connected' : 'disconnected';
      if (key === 'platform.lastValidatedAt') return platformStatus?.lastValidatedAt || '';
      if (key === 'assistant.prompts.forgeAssistant') return forgeAssistantPrompt;
      if (key === 'assistant.prompts.codexAssistant') return codexAssistantPrompt;
      return '';
    },
    setFieldValue: (key: string, value: string | boolean) => {
      if (key === 'env.profile') {
        onProfileChange(String(value || ''));
        return;
      }
      if (key === 'env.mode') {
        const modeValue = String(value || '').trim().toLowerCase();
        if (modeValue === 'local' || modeValue === 'preview' || modeValue === 'production' || modeValue === 'headless') {
          onModeChange(modeValue);
        }
        return;
      }
      if (key === 'commands.confirmRuns') {
        onConfirmRunsChange(value === true);
        return;
      }
      if (key === 'reviewQueue.trustMode') {
        const trustMode = String(value || '').trim().toLowerCase();
        onReviewQueueTrustModeChange(trustMode === 'auto-approve-all' ? 'auto-approve-all' : 'require-approval');
        return;
      }
      if (key === 'platform.baseUrl') {
        onPlatformBaseUrlChange(String(value || ''));
        return;
      }
      if (key === 'platform.autoValidate') {
        onPlatformAutoValidateChange(value === true);
        return;
      }
      if (key === 'assistant.prompts.forgeAssistant') {
        onForgeAssistantPromptChange(String(value || ''));
        return;
      }
      if (key === 'assistant.prompts.codexAssistant') {
        onCodexAssistantPromptChange(String(value || ''));
        return;
      }
    },
  }), [
    activeLoopId,
    codexAssistantPrompt,
    confirmRuns,
    forgeAssistantPrompt,
    mode,
    onConfirmRunsChange,
    onCodexAssistantPromptChange,
    onForgeAssistantPromptChange,
    onModeChange,
    onReviewQueueTrustModeChange,
    onPlatformAutoValidateChange,
    onPlatformBaseUrlChange,
    onPlatformConnect,
    onPlatformDisconnect,
    onPlatformValidate,
    onProfileChange,
    onRestorePanels,
    onSetPanelVisible,
    onStopRuntime,
    panelSpecs,
    panelVisibility,
    platformAutoValidate,
    platformBaseUrl,
    platformBusy,
    platformStatus,
    profile,
    reviewQueueLastAutoApplyAt,
    reviewQueueTrustMode,
  ]);

  return (
    <RepoSettingsContext.Provider value={value}>
      {children}
    </RepoSettingsContext.Provider>
  );
}

export function useRepoSettings() {
  const context = React.useContext(RepoSettingsContext);
  if (!context) {
    throw new Error('useRepoSettings must be used within RepoSettingsProvider.');
  }
  return context;
}


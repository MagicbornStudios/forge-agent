'use client';

import * as React from 'react';
import type { RepoAuthStatusResponse } from '@/lib/api/types';
import type { RepoEditorPanelSpec } from '@/lib/app-shell/editor-panels';
import { RepoSettingsProvider } from './RepoSettingsProvider';
import { RepoSettingsRegistrations } from './RepoSettingsRegistrations';

export interface RepoSettingsPanelContentProps {
  profile: string;
  mode: 'local' | 'preview' | 'production' | 'headless';
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
  onModeChange: (value: 'local' | 'preview' | 'production' | 'headless') => void;
  onConfirmRunsChange: (value: boolean) => void;
  onReviewQueueTrustModeChange: (value: 'require-approval' | 'auto-approve-all') => void;
  onForgeAssistantPromptChange: (value: string) => void;
  onCodexAssistantPromptChange: (value: string) => void;
  onPlatformBaseUrlChange: (value: string) => void;
  onPlatformAutoValidateChange: (value: boolean) => void;
  onPlatformConnect: (input: { baseUrl: string; token: string }) => Promise<void>;
  onPlatformValidate: (input?: { baseUrl?: string; token?: string }) => Promise<void>;
  onPlatformDisconnect: () => Promise<void>;
  onSetPanelVisible: (panelId: string, visible: boolean) => void;
  onRestorePanels: () => void;
  onStopRuntime: () => void;
}

export function RepoSettingsPanelContent(props: RepoSettingsPanelContentProps) {
  return (
    <RepoSettingsProvider {...props}>
      <RepoSettingsRegistrations />
    </RepoSettingsProvider>
  );
}


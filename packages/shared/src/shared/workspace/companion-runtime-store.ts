'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resolveCompanionRuntimeBaseUrl } from './companion-runtime';

export interface CompanionRuntimeState {
  repoStudioBaseUrl: string | null;
  repoStudioAvailable: boolean;
  useRepoStudioRuntime: boolean;
  useCodexAssistant: boolean;
  setRepoStudioBaseUrl: (url: string | null) => void;
  setRepoStudioAvailable: (available: boolean) => void;
  setUseRepoStudioRuntime: (use: boolean) => void;
  setUseCodexAssistant: (use: boolean) => void;
}

const STORE_KEY = 'forge:companion-runtime:v1';

export const useCompanionRuntimeStore = create<CompanionRuntimeState>()(
  persist(
    (set) => ({
      repoStudioBaseUrl: resolveCompanionRuntimeBaseUrl(null),
      repoStudioAvailable: false,
      useRepoStudioRuntime: false,
      useCodexAssistant: false,
      setRepoStudioBaseUrl: (url) => {
        set({
          repoStudioBaseUrl: resolveCompanionRuntimeBaseUrl(url),
        });
      },
      setRepoStudioAvailable: (available) => {
        set({
          repoStudioAvailable: available === true,
        });
      },
      setUseRepoStudioRuntime: (use) => {
        set({
          useRepoStudioRuntime: use === true,
        });
      },
      setUseCodexAssistant: (use) => {
        set({
          useCodexAssistant: use === true,
        });
      },
    }),
    {
      name: STORE_KEY,
      partialize: (state) => ({
        repoStudioBaseUrl: state.repoStudioBaseUrl,
        useRepoStudioRuntime: state.useRepoStudioRuntime,
        useCodexAssistant: state.useCodexAssistant,
      }),
    },
  ),
);


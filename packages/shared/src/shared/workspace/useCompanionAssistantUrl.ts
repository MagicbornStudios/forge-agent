'use client';

import { useMemo } from 'react';
import { useCompanionRuntimeStore } from './companion-runtime-store';

export interface UseCompanionAssistantUrlOptions {
  fallbackUrl?: string | null;
}

/**
 * Resolves assistant URL from companion runtime state.
 * Returns companion URL when enabled and available; otherwise fallbackUrl (or null).
 */
export function useCompanionAssistantUrl(options?: UseCompanionAssistantUrlOptions): string | null {
  const useRepoStudioRuntime = useCompanionRuntimeStore((state) => state.useRepoStudioRuntime);
  const repoStudioBaseUrl = useCompanionRuntimeStore((state) => state.repoStudioBaseUrl);
  const useCodexAssistant = useCompanionRuntimeStore((state) => state.useCodexAssistant);
  const fallbackUrl = options?.fallbackUrl ?? null;

  return useMemo(() => {
    if (useRepoStudioRuntime && repoStudioBaseUrl) {
      const base = `${repoStudioBaseUrl.replace(/\/$/, '')}/api/assistant-chat`;
      if (useCodexAssistant) {
        return `${base}?assistantTarget=codex`;
      }
      return base;
    }
    return fallbackUrl;
  }, [fallbackUrl, repoStudioBaseUrl, useCodexAssistant, useRepoStudioRuntime]);
}

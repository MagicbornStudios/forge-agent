'use client';

import { useAppShellStore } from '@/lib/app-shell/store';
import { API_ROUTES } from '@/lib/api-client/routes';

/**
 * Resolves the assistant-chat API URL: Repo Studio when user opted in (optionally with Codex), otherwise same-origin.
 * When useCodexAssistant is true and Repo Studio is the runtime, appends editorTarget=codex-assistant for the Codex coding agent.
 */
export function useAssistantChatUrl(): string {
  const useRepoStudioRuntime = useAppShellStore((s) => s.useRepoStudioRuntime);
  const repoStudioBaseUrl = useAppShellStore((s) => s.repoStudioBaseUrl);
  const useCodexAssistant = useAppShellStore((s) => s.useCodexAssistant);
  if (useRepoStudioRuntime && repoStudioBaseUrl) {
    const base = `${repoStudioBaseUrl.replace(/\/$/, '')}/api/assistant-chat`;
    if (useCodexAssistant) {
      return `${base}?editorTarget=codex-assistant`;
    }
    return base;
  }
  return API_ROUTES.ASSISTANT_CHAT;
}

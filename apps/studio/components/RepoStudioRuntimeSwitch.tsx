'use client';

import * as React from 'react';
import { useCompanionRuntimeDetection } from '@forge/shared';
import { useAppShellStore } from '@/lib/app-shell/store';
import { Switch } from '@forge/ui/switch';
import { Label } from '@forge/ui/label';
import { Server, Code2 } from 'lucide-react';

const REPO_STUDIO_APP_URL =
  typeof process.env.NEXT_PUBLIC_REPO_STUDIO_APP_URL === 'string'
    ? process.env.NEXT_PUBLIC_REPO_STUDIO_APP_URL.trim() || null
    : null;

/**
 * Opt-in switch to use Repo Studio as AI runtime. Only visible when Repo Studio is detected (health ping succeeds).
 * When on, assistant-chat and related requests go to Repo Studio's base URL.
 * When "Use Codex" is on, uses Codex (coding agent) instead of Open Router assistant.
 */
export function RepoStudioRuntimeSwitch() {
  const baseUrl = REPO_STUDIO_APP_URL;
  const { available, checking } = useCompanionRuntimeDetection(baseUrl);
  const repoStudioBaseUrl = useAppShellStore((s) => s.repoStudioBaseUrl);
  const useRepoStudioRuntime = useAppShellStore((s) => s.useRepoStudioRuntime);
  const useCodexAssistant = useAppShellStore((s) => s.useCodexAssistant);
  const setRepoStudioBaseUrl = useAppShellStore((s) => s.setRepoStudioBaseUrl);
  const setRepoStudioAvailable = useAppShellStore((s) => s.setRepoStudioAvailable);
  const setUseRepoStudioRuntime = useAppShellStore((s) => s.setUseRepoStudioRuntime);
  const setUseCodexAssistant = useAppShellStore((s) => s.setUseCodexAssistant);

  React.useEffect(() => {
    if (baseUrl && available) {
      setRepoStudioBaseUrl(baseUrl);
      setRepoStudioAvailable(true);
    }
  }, [baseUrl, available, setRepoStudioBaseUrl, setRepoStudioAvailable]);

  if (!baseUrl || checking || !available) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Server className="size-4 text-muted-foreground" aria-hidden />
        <Label htmlFor="repo-studio-runtime" className="text-xs text-muted-foreground whitespace-nowrap">
          Use Repo Studio for AI
        </Label>
        <Switch
          id="repo-studio-runtime"
          checked={useRepoStudioRuntime}
          onCheckedChange={setUseRepoStudioRuntime}
          aria-label="Use Repo Studio for AI"
        />
      </div>
      {useRepoStudioRuntime && (
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-muted-foreground" aria-hidden />
          <Label htmlFor="repo-studio-codex" className="text-xs text-muted-foreground whitespace-nowrap">
            Use Codex
          </Label>
          <Switch
            id="repo-studio-codex"
            checked={useCodexAssistant}
            onCheckedChange={setUseCodexAssistant}
            aria-label="Use Codex coding agent"
          />
        </div>
      )}
    </div>
  );
}

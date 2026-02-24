'use client';

import * as React from 'react';
import { Code2, Server } from 'lucide-react';
import { Label } from '@forge/ui/label';
import { Switch } from '@forge/ui/switch';
import { resolveCompanionRuntimeBaseUrl, useCompanionRuntimeDetection } from './companion-runtime';
import { useCompanionRuntimeStore } from './companion-runtime-store';

export interface CompanionRuntimeSwitchProps {
  baseUrl?: string | null;
  className?: string;
}

/**
 * Opt-in switch to route assistant traffic through Repo Studio companion runtime.
 * Hidden until the companion health endpoint is reachable.
 */
export function CompanionRuntimeSwitch({ baseUrl, className }: CompanionRuntimeSwitchProps) {
  const resolvedBaseUrl = React.useMemo(
    () => resolveCompanionRuntimeBaseUrl(baseUrl),
    [baseUrl],
  );
  const { available, checking } = useCompanionRuntimeDetection(resolvedBaseUrl);
  const useRepoStudioRuntime = useCompanionRuntimeStore((state) => state.useRepoStudioRuntime);
  const useCodexAssistant = useCompanionRuntimeStore((state) => state.useCodexAssistant);
  const setRepoStudioBaseUrl = useCompanionRuntimeStore((state) => state.setRepoStudioBaseUrl);
  const setRepoStudioAvailable = useCompanionRuntimeStore((state) => state.setRepoStudioAvailable);
  const setUseRepoStudioRuntime = useCompanionRuntimeStore((state) => state.setUseRepoStudioRuntime);
  const setUseCodexAssistant = useCompanionRuntimeStore((state) => state.setUseCodexAssistant);

  React.useEffect(() => {
    setRepoStudioBaseUrl(resolvedBaseUrl);
    setRepoStudioAvailable(available);
    if (!available) {
      setUseRepoStudioRuntime(false);
      setUseCodexAssistant(false);
    }
  }, [
    available,
    resolvedBaseUrl,
    setRepoStudioAvailable,
    setRepoStudioBaseUrl,
    setUseCodexAssistant,
    setUseRepoStudioRuntime,
  ]);

  if (!resolvedBaseUrl || checking || !available) {
    return null;
  }

  return (
    <div className={className ? className : 'flex items-center gap-3'}>
      <div className="flex items-center gap-2">
        <Server className="size-4 text-muted-foreground" aria-hidden />
        <Label htmlFor="companion-runtime" className="text-xs whitespace-nowrap text-muted-foreground">
          Use Repo Studio for AI
        </Label>
        <Switch
          id="companion-runtime"
          checked={useRepoStudioRuntime}
          onCheckedChange={setUseRepoStudioRuntime}
          aria-label="Use Repo Studio for AI"
        />
      </div>

      {useRepoStudioRuntime ? (
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-muted-foreground" aria-hidden />
          <Label htmlFor="companion-runtime-codex" className="text-xs whitespace-nowrap text-muted-foreground">
            Use Codex
          </Label>
          <Switch
            id="companion-runtime-codex"
            checked={useCodexAssistant}
            onCheckedChange={setUseCodexAssistant}
            aria-label="Use Codex coding agent"
          />
        </div>
      ) : null}
    </div>
  );
}


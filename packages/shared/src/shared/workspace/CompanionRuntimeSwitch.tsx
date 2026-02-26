'use client';

import * as React from 'react';
import { Code2, Server } from 'lucide-react';
import { Label } from '@forge/ui/label';
import { Switch } from '@forge/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@forge/ui/tooltip';
import { resolveCompanionRuntimeBaseUrl, useCompanionRuntimeDetection } from './companion-runtime';
import { useCompanionRuntimeStore } from './companion-runtime-store';

export interface CompanionRuntimeSwitchProps {
  baseUrl?: string | null;
  className?: string;
}

export interface CompanionIndicatorProps {
  baseUrl?: string | null;
  className?: string;
}

function companionTooltip(checking: boolean, available: boolean): string {
  if (checking) return 'Repo Studio: checking…';
  if (available) return 'Repo Studio: connected';
  return 'Repo Studio: not detected (run pnpm dev:repo-studio)';
}

/**
 * Always-visible companion indicator: icon + tooltip. When companion is available, shows toggles.
 * Use in the app bar so users see that a companion app (Repo Studio) can be used for AI.
 */
export function CompanionIndicator({ baseUrl, className }: CompanionIndicatorProps) {
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

  const tooltip = companionTooltip(checking, available);

  return (
    <div className={className ?? 'flex items-center gap-2'}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="flex h-[var(--control-height-sm)] w-[var(--control-height-sm)] shrink-0 items-center justify-center rounded border border-transparent text-muted-foreground hover:border-border hover:bg-accent/40 hover:text-foreground"
            aria-label={tooltip}
          >
            <Server
              className={`size-4 ${available ? 'text-green-600 dark:text-green-500' : ''}`}
              aria-hidden
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {tooltip}
        </TooltipContent>
      </Tooltip>

      {resolvedBaseUrl && available ? (
        <>
          <div className="flex items-center gap-1.5">
            <Label htmlFor="companion-runtime" className="sr-only">
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
            <div className="flex items-center gap-1.5">
              <Code2 className="size-4 text-muted-foreground" aria-hidden />
              <Label htmlFor="companion-runtime-codex" className="sr-only">
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
        </>
      ) : null}
    </div>
  );
}

/**
 * Opt-in switch to route assistant traffic through Repo Studio companion runtime.
 * Hidden until the companion health endpoint is reachable.
 * Prefer CompanionIndicator in the app bar so the companion concept is always visible.
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


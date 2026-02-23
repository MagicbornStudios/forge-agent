'use client';

import * as React from 'react';
import { LoaderCircle, Play, RefreshCw, Square } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { TooltipButton } from '@forge/ui/tooltip-button';
import { cn } from '@forge/shared/lib/utils';
import {
  fetchCodexSessionStatus,
  loginCodex,
  startCodexSession,
  stopCodexSession,
} from '@/lib/api/services';
import type { CodexSessionStatusResponse } from '@/lib/api/types';
import { ApiRequestError, toErrorMessage } from '@/lib/api/http';

type RepoCodexControlsProps = {
  className?: string;
};

function payloadMessage(error: unknown) {
  if (!(error instanceof ApiRequestError)) return '';
  if (!error.payload || typeof error.payload !== 'object') return '';
  const message = (error.payload as { message?: unknown }).message;
  return typeof message === 'string' ? message : '';
}

function OpenAILogoMark({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12.01 2.28c2.02 0 3.88 1.09 4.89 2.85a5.62 5.62 0 0 1 4.81 8.36 5.64 5.64 0 0 1-2.37 7.45 5.62 5.62 0 0 1-8.4 1.9 5.62 5.62 0 0 1-8.2-5.11 5.62 5.62 0 0 1 1.15-10.8 5.62 5.62 0 0 1 8.12-4.65Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 8.74 15.7 4.5M8.3 8.74v8.52m0-8.52 7.4 4.24m0 0V4.5m0 8.48-7.4 4.28m7.4-4.28v8.5m-7.4-4.22 7.4 4.22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildStatusTooltip(status: CodexSessionStatusResponse | null) {
  const readiness = status?.codex?.readiness;
  const cliInstalled = readiness?.cli?.installed === true;
  const cliVersion = readiness?.cli?.version || 'unknown';
  const cliSource = readiness?.cli?.source || 'unknown';
  const login = readiness?.login?.loggedIn === true
    ? readiness?.login?.authType || 'logged-in'
    : 'not-logged-in';
  const session = status?.codex?.appServerReachable === true ? 'running' : 'stopped';
  return [
    `CLI: ${cliInstalled ? `ready (${cliVersion})` : 'missing'}`,
    `Source: ${cliSource}`,
    `Login: ${login}`,
    `Session: ${session}`,
  ].join('\n');
}

export function RepoCodexControls({ className }: RepoCodexControlsProps) {
  const [status, setStatus] = React.useState<CodexSessionStatusResponse | null>(null);
  const [message, setMessage] = React.useState('');
  const [authUrl, setAuthUrl] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [runningAction, setRunningAction] = React.useState<null | 'login' | 'session'>(null);

  const refreshStatus = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const payload = await fetchCodexSessionStatus();
      setStatus(payload);
      setMessage(payload.message || 'Codex status refreshed.');
    } catch (error) {
      setMessage(payloadMessage(error) || toErrorMessage(error, 'Unable to load Codex status.'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    refreshStatus().catch(() => {});
  }, [refreshStatus]);

  const handleLogin = React.useCallback(async () => {
    setRunningAction('login');
    setAuthUrl('');
    try {
      const payload = await loginCodex();
      setMessage(payload.message || 'Codex login completed.');
      setAuthUrl(payload.authUrl || '');
      if (payload.authUrl) {
        window.open(payload.authUrl, '_blank', 'noopener,noreferrer');
      }
      await refreshStatus();
    } catch (error) {
      setMessage(payloadMessage(error) || toErrorMessage(error, 'Codex login failed.'));
    } finally {
      setRunningAction(null);
    }
  }, [refreshStatus]);

  const sessionRunning = status?.codex?.appServerReachable === true;
  const cliInstalled = status?.codex?.readiness?.cli?.installed === true;

  const handleToggleSession = React.useCallback(async () => {
    setRunningAction('session');
    try {
      if (sessionRunning) {
        const payload = await stopCodexSession();
        setMessage(payload.message || 'Codex session stopped.');
      } else {
        const payload = await startCodexSession();
        setMessage(payload.message || 'Codex session started.');
      }
      await refreshStatus();
    } catch (error) {
      setMessage(payloadMessage(error) || toErrorMessage(error, 'Unable to update Codex session.'));
    } finally {
      setRunningAction(null);
    }
  }, [refreshStatus, sessionRunning]);

  const busy = refreshing || runningAction !== null;
  const statusTooltip = buildStatusTooltip(status);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <TooltipButton
        size="icon"
        variant="ghost"
        onClick={handleLogin}
        disabled={busy}
        tooltip={`Sign in to Codex\n${statusTooltip}`}
        aria-label="Sign in to Codex"
      >
        <OpenAILogoMark className="size-4" />
      </TooltipButton>
      <TooltipButton
        size="icon"
        variant="ghost"
        onClick={() => refreshStatus()}
        disabled={busy}
        tooltip={`Refresh Codex status\n${statusTooltip}`}
        aria-label="Refresh Codex status"
      >
        {refreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
      </TooltipButton>
      <TooltipButton
        size="icon"
        variant={sessionRunning ? 'destructive' : 'ghost'}
        onClick={handleToggleSession}
        disabled={busy || (!sessionRunning && !cliInstalled)}
        tooltip={`${sessionRunning ? 'Stop' : 'Start'} Codex session\n${statusTooltip}`}
        aria-label={sessionRunning ? 'Stop Codex session' : 'Start Codex session'}
      >
        {runningAction === 'session'
          ? <LoaderCircle className="size-4 animate-spin" />
          : sessionRunning
            ? <Square className="size-4" />
            : <Play className="size-4" />}
      </TooltipButton>
      {message ? (
        <p className="max-w-[260px] truncate text-[10px] text-muted-foreground" title={authUrl || message}>
          {authUrl ? `Auth: ${authUrl}` : message}
        </p>
      ) : null}
      {authUrl ? (
        <Button
          size="sm"
          variant="link"
          className="h-auto p-0 text-[10px]"
          onClick={() => window.open(authUrl, '_blank', 'noopener,noreferrer')}
        >
          Open auth URL
        </Button>
      ) : null}
    </div>
  );
}

'use client';

import * as React from 'react';
import { Github, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { TooltipButton } from '@forge/ui/tooltip-button';
import { cn } from '@forge/shared/lib/utils';
import {
  fetchCodexSessionStatus,
  fetchGitHubStatus,
  pollGitHubDeviceLogin,
  loginCodex,
  startGitHubDeviceLogin,
} from '@/lib/api/services';
import type { CodexSessionStatusResponse, GitHubAuthStatusResponse } from '@/lib/api/types';
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

function payloadFromError<T>(error: unknown): T | null {
  if (!(error instanceof ApiRequestError)) return null;
  if (!error.payload || typeof error.payload !== 'object') return null;
  return error.payload as T;
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
      <path fill="currentColor" d="M22.281 12.002a5.997 5.997 0 0 0-8.91-5.25A6.001 6.001 0 0 0 2.71 9.658 5.997 5.997 0 0 0 6 20.884a6 6 0 0 0 10.311.412 5.997 5.997 0 0 0 5.97-9.294Zm-4.19 7.307a3.952 3.952 0 0 1-1.218-.19l-3.22-1.03v-5.512l4.775 1.538a3.954 3.954 0 0 1-.337 5.194Zm-10.31-.846A3.954 3.954 0 0 1 6.24 11.41l4.777 1.537v5.527L7.78 17.45Zm8.583-11.58a3.954 3.954 0 0 1 1.522 7.154l-4.775-1.538V6.97l3.253-.085ZM9.788 4.69c.42 0 .837.066 1.237.196v5.514L6.25 8.863A3.954 3.954 0 0 1 9.789 4.69Zm-.784 15.041 2.021-2.485 2.02 2.485A3.954 3.954 0 0 1 9.004 19.73Z" />
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

function buildGitHubTooltip(status: GitHubAuthStatusResponse | null) {
  const configured = status?.github?.configured !== false;
  const loggedIn = status?.github?.loggedIn === true;
  const username = status?.github?.username || 'not-logged-in';
  return [
    `OAuth: ${configured ? 'configured' : 'missing-client-id'}`,
    `Login: ${loggedIn ? username : 'not-logged-in'}`,
    `Host: ${status?.github?.host || 'github.com'}`,
    `Scopes: ${(status?.github?.scopes || []).join(', ') || 'none'}`,
  ].join('\n');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function RepoCodexControls({ className }: RepoCodexControlsProps) {
  const [status, setStatus] = React.useState<CodexSessionStatusResponse | null>(null);
  const [githubStatus, setGitHubStatus] = React.useState<GitHubAuthStatusResponse | null>(null);
  const [message, setMessage] = React.useState('');
  const [authUrl, setAuthUrl] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [runningAction, setRunningAction] = React.useState<null | 'codex-login' | 'github-login'>(null);

  const refreshStatus = React.useCallback(async (announce = false) => {
    setRefreshing(true);
    try {
      const [codexResult, githubResult] = await Promise.allSettled([
        fetchCodexSessionStatus(),
        fetchGitHubStatus(),
      ]);

      const messages: string[] = [];
      if (codexResult.status === 'fulfilled') {
        setStatus(codexResult.value);
      } else {
        const payload = payloadFromError<CodexSessionStatusResponse>(codexResult.reason);
        if (payload) {
          setStatus(payload);
          if (announce && payload.message) messages.push(payload.message);
        } else {
          messages.push(payloadMessage(codexResult.reason) || toErrorMessage(codexResult.reason, 'Codex status failed.'));
        }
      }

      if (githubResult.status === 'fulfilled') {
        setGitHubStatus(githubResult.value);
      } else {
        const payload = payloadFromError<GitHubAuthStatusResponse>(githubResult.reason);
        if (payload) {
          setGitHubStatus(payload);
          if (announce && payload.message) messages.push(payload.message);
        } else {
          messages.push(payloadMessage(githubResult.reason) || toErrorMessage(githubResult.reason, 'GitHub status failed.'));
        }
      }

      if (announce) {
        setMessage(messages.length > 0 ? messages.join(' ') : 'Status refreshed.');
      }
    } catch (error) {
      setMessage(payloadMessage(error) || toErrorMessage(error, 'Unable to load Codex status.'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    refreshStatus(false).catch(() => {});
  }, [refreshStatus]);

  const handleLogin = React.useCallback(async () => {
    setRunningAction('codex-login');
    setAuthUrl('');
    try {
      const payload = await loginCodex();
      setMessage(payload.message || 'Codex login completed.');
      setAuthUrl(payload.authUrl || '');
      if (payload.authUrl) {
        window.open(payload.authUrl, '_blank', 'noopener,noreferrer');
      }
      await refreshStatus(false);
    } catch (error) {
      setMessage(payloadMessage(error) || toErrorMessage(error, 'Codex login failed.'));
    } finally {
      setRunningAction(null);
    }
  }, [refreshStatus]);

  const handleGitHubLogin = React.useCallback(async () => {
    setRunningAction('github-login');
    setAuthUrl('');
    try {
      const started = await startGitHubDeviceLogin();
      if (!started.ok || !started.deviceCode) {
        setMessage(started.message || 'Unable to start GitHub login.');
        await refreshStatus(false);
        return;
      }
      setMessage(started.message || 'Waiting for GitHub authorization...');
      setAuthUrl(started.authUrl || '');
      if (started.authUrl) window.open(started.authUrl, '_blank', 'noopener,noreferrer');

      const deviceCode = String(started.deviceCode || '').trim();
      const pollMs = Math.max(3000, Number(started.interval || 5) * 1000);
      const startedAt = Date.now();
      const expiresMs = Math.max(30000, Number(started.expiresIn || 600) * 1000);

      while (Date.now() - startedAt < expiresMs) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(pollMs);
        // eslint-disable-next-line no-await-in-loop
        const poll = await pollGitHubDeviceLogin(deviceCode);
        if (poll.pending) {
          setMessage(poll.message || 'Waiting for GitHub authorization...');
          continue;
        }
        setMessage(poll.message || (poll.ok ? 'GitHub login completed.' : 'GitHub login failed.'));
        if (poll.ok) {
          setAuthUrl('');
        }
        break;
      }
      if (Date.now() - startedAt >= expiresMs) {
        setMessage('GitHub login timed out before authorization completed.');
      }

      await refreshStatus(false);
    } catch (error) {
      setMessage(payloadMessage(error) || toErrorMessage(error, 'GitHub login failed.'));
    } finally {
      setRunningAction(null);
    }
  }, [refreshStatus]);

  const codexLoggedIn = status?.codex?.readiness?.login?.loggedIn === true;
  const githubLoggedIn = githubStatus?.github?.loggedIn === true;
  const githubUser = githubStatus?.github?.username || '';

  const busy = refreshing || runningAction !== null;
  const statusTooltip = buildStatusTooltip(status);
  const githubTooltip = buildGitHubTooltip(githubStatus);
  const codexLoginHint = codexLoggedIn ? 'Logged in' : 'Not logged in';
  const githubLoginHint = githubLoggedIn ? `Logged in as ${githubUser}` : 'Not logged in';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <TooltipButton
        size="icon"
        variant="ghost"
        onClick={handleLogin}
        disabled={busy}
        tooltip={`OpenAI / Codex\n${codexLoginHint}\n${statusTooltip}`}
        aria-label="Sign in to Codex"
        className={cn(codexLoggedIn && 'text-emerald-400')}
      >
        <OpenAILogoMark className="size-4" />
      </TooltipButton>
      <TooltipButton
        size="icon"
        variant="ghost"
        onClick={handleGitHubLogin}
        disabled={busy}
        tooltip={`GitHub auth\n${githubLoginHint}\n${githubTooltip}`}
        aria-label="Sign in to GitHub"
        className={cn(githubLoggedIn && 'text-emerald-400')}
      >
        <Github className="size-4" />
      </TooltipButton>
      <TooltipButton
        size="icon"
        variant="ghost"
        onClick={() => refreshStatus(true)}
        disabled={busy}
        tooltip={`Refresh auth status\n${statusTooltip}\n\n${githubTooltip}`}
        aria-label="Refresh auth status"
      >
        {refreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
      </TooltipButton>
      {message ? (
        <p className="max-w-[260px] truncate text-[10px] text-muted-foreground" title={message}>
          {message}
        </p>
      ) : null}
      {authUrl ? (
        <Button
          size="sm"
          variant="link"
          className="h-auto p-0 text-[10px]"
          onClick={() => window.open(authUrl, '_blank', 'noopener,noreferrer')}
        >
          Open auth
        </Button>
      ) : null}
    </div>
  );
}

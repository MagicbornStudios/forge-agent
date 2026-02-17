import { getJson, postJson } from '@/lib/api/http';

export type CodexSessionStatus = {
  ok: boolean;
  codex?: {
    appServerReachable?: boolean;
    protocolInitialized?: boolean;
    activeThreadCount?: number;
    activeTurnCount?: number;
    execFallbackEnabled?: boolean;
    threadId?: string | null;
    readiness?: {
      ok?: boolean;
      missing?: string[];
    };
  };
  message?: string;
};

export async function fetchCodexSessionStatus() {
  return getJson<CodexSessionStatus>('/api/repo/codex/session/status', {
    fallbackMessage: 'Unable to load Codex session status.',
  });
}

export async function startCodexSession(input: { reuse?: boolean; wsPort?: number } = {}) {
  return postJson<CodexSessionStatus>('/api/repo/codex/session/start', input, {
    fallbackMessage: 'Unable to start Codex session.',
  });
}

export async function stopCodexSession() {
  return postJson<CodexSessionStatus>('/api/repo/codex/session/stop', {}, {
    fallbackMessage: 'Unable to stop Codex session.',
  });
}


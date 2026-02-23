import { getJson, postJson } from '@/lib/api/http';
import type {
  CodexLoginResponse,
  CodexSessionStartResponse,
  CodexSessionStatusResponse,
  CodexSessionStopResponse,
} from '@/lib/api/types';

export async function fetchCodexSessionStatus() {
  return getJson<CodexSessionStatusResponse>('/api/repo/codex/session/status', {
    fallbackMessage: 'Unable to load Codex session status.',
  });
}

export async function startCodexSession(input: { reuse?: boolean; wsPort?: number } = {}) {
  return postJson<CodexSessionStartResponse>('/api/repo/codex/session/start', input, {
    fallbackMessage: 'Unable to start Codex session.',
  });
}

export async function stopCodexSession() {
  return postJson<CodexSessionStopResponse>('/api/repo/codex/session/stop', {}, {
    fallbackMessage: 'Unable to stop Codex session.',
  });
}

export async function loginCodex() {
  return postJson<CodexLoginResponse>('/api/repo/codex/login', {}, {
    fallbackMessage: 'Unable to run Codex login.',
  });
}

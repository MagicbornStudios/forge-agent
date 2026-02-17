import { getJson, postJson } from '@/lib/api/http';
import type { RepoAuthStatusResponse } from '@/lib/api/types';
import { getDesktopRuntimeBridge } from '@/lib/desktop-runtime';

type DesktopAuthBridge = {
  authStatus: () => Promise<RepoAuthStatusResponse>;
  authConnect: (payload: { baseUrl: string; token: string }) => Promise<RepoAuthStatusResponse>;
  authDisconnect: () => Promise<RepoAuthStatusResponse>;
  authValidate: (payload?: { baseUrl?: string; token?: string }) => Promise<RepoAuthStatusResponse>;
};

function getDesktopAuthBridge(): DesktopAuthBridge | null {
  const bridge = getDesktopRuntimeBridge();
  if (!bridge) return null;
  if (
    typeof bridge.authStatus !== 'function'
    || typeof bridge.authConnect !== 'function'
    || typeof bridge.authDisconnect !== 'function'
    || typeof bridge.authValidate !== 'function'
  ) {
    return null;
  }
  return bridge as DesktopAuthBridge;
}

export async function fetchRepoAuthStatus() {
  const bridge = getDesktopAuthBridge();
  if (bridge) return bridge.authStatus();
  return getJson<RepoAuthStatusResponse>('/api/repo/auth/status', {
    fallbackMessage: 'Unable to load platform connection status.',
  });
}

export async function connectRepoAuth(input: { baseUrl: string; token: string }) {
  const bridge = getDesktopAuthBridge();
  if (bridge) {
    return bridge.authConnect({
      baseUrl: input.baseUrl,
      token: input.token,
    });
  }
  return postJson<RepoAuthStatusResponse>('/api/repo/auth/connect', input, {
    fallbackMessage: 'Unable to connect to platform.',
  });
}

export async function validateRepoAuth(input: { baseUrl?: string; token?: string } = {}) {
  const bridge = getDesktopAuthBridge();
  if (bridge) return bridge.authValidate(input);
  return postJson<RepoAuthStatusResponse>('/api/repo/auth/validate', input, {
    fallbackMessage: 'Unable to validate platform connection.',
  });
}

export async function disconnectRepoAuth() {
  const bridge = getDesktopAuthBridge();
  if (bridge) return bridge.authDisconnect();
  return postJson<RepoAuthStatusResponse>('/api/repo/auth/disconnect', {}, {
    fallbackMessage: 'Unable to disconnect platform connection.',
  });
}

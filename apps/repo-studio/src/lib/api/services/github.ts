import { getJson, postJson } from '@/lib/api/http';
import type {
  GitHubAuthStatusResponse,
  GitHubDevicePollResponse,
  GitHubDeviceStartResponse,
  GitHubLogoutResponse,
} from '@/lib/api/types';

export async function fetchGitHubStatus() {
  return getJson<GitHubAuthStatusResponse>('/api/repo/github/status', {
    fallbackMessage: 'Unable to load GitHub auth status.',
    timeoutMs: 12000,
  });
}

export async function startGitHubDeviceLogin() {
  return postJson<GitHubDeviceStartResponse>('/api/repo/github/oauth/device/start', {}, {
    fallbackMessage: 'Unable to start GitHub device login.',
    timeoutMs: 20000,
  });
}

export async function pollGitHubDeviceLogin(deviceCode: string) {
  return postJson<GitHubDevicePollResponse>('/api/repo/github/oauth/device/poll', {
    deviceCode,
  }, {
    fallbackMessage: 'Unable to poll GitHub device login.',
    timeoutMs: 20000,
  });
}

export async function logoutGitHub() {
  return postJson<GitHubLogoutResponse>('/api/repo/github/logout', {}, {
    fallbackMessage: 'Unable to logout GitHub.',
    timeoutMs: 12000,
  });
}

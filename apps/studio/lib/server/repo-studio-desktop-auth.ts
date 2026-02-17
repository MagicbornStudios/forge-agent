import type { Payload } from 'payload';
import {
  requireRequestAuth,
  type ApiKeyScope,
  type AiRequestAuthContext,
} from '@/lib/server/api-keys';

export type RepoStudioDesktopCapabilities = {
  connect: boolean;
  read: boolean;
  write: boolean;
};

export type RepoStudioDesktopAuthResult =
  | {
    ok: true;
    context: AiRequestAuthContext;
    capabilities: RepoStudioDesktopCapabilities;
  }
  | {
    ok: false;
    status: 401 | 403;
    message: string;
  };

function hasScopedCapability(scopes: ApiKeyScope[], target: ApiKeyScope) {
  if (scopes.includes('repo-studio.*')) return true;
  return scopes.includes(target);
}

export function buildRepoStudioCapabilities(
  scopes: ApiKeyScope[],
): RepoStudioDesktopCapabilities {
  const write = hasScopedCapability(scopes, 'repo-studio.write');
  const read = hasScopedCapability(scopes, 'repo-studio.read') || write;
  const connect = hasScopedCapability(scopes, 'repo-studio.connect');

  return {
    connect,
    read,
    write,
  };
}

export async function requireRepoStudioDesktopAuth(
  payload: Payload,
  request: Request,
): Promise<RepoStudioDesktopAuthResult> {
  const auth = await requireRequestAuth(payload, request, 'repo-studio.connect');
  if (!auth.ok) {
    const remediation = auth.status === 403
      ? 'Grant `repo-studio.connect` or `repo-studio.*` scope and retry.'
      : 'Provide a valid Studio session or API key.';
    return {
      ok: false,
      status: auth.status,
      message: `${auth.message} ${remediation}`.trim(),
    };
  }

  const capabilities = buildRepoStudioCapabilities(auth.context.scopes);
  if (!capabilities.connect) {
    return {
      ok: false,
      status: 403,
      message: 'Missing required scope: repo-studio.connect. Grant `repo-studio.connect` or `repo-studio.*`.',
    };
  }

  return {
    ok: true,
    context: auth.context,
    capabilities,
  };
}

type RepoAuthCapabilities = {
  connect: boolean;
  read: boolean;
  write: boolean;
};

export type RepoAuthStatusPayload = {
  ok: boolean;
  connected: boolean;
  baseUrl: string;
  provider: 'memory';
  lastValidatedAt: string | null;
  capabilities: RepoAuthCapabilities;
  message: string;
  status?: number;
  authType?: 'api_key' | 'session' | string;
  userId?: number | null;
  organizationId?: number | null;
  scopes?: string[];
  serverTime?: string | null;
};

const DEFAULT_CAPABILITIES: RepoAuthCapabilities = {
  connect: false,
  read: false,
  write: false,
};

let runtimeState: {
  baseUrl: string;
  token: string;
  lastValidatedAt: string | null;
  capabilities: RepoAuthCapabilities;
  message: string;
  connected: boolean;
} = {
  baseUrl: '',
  token: '',
  lastValidatedAt: null,
  capabilities: { ...DEFAULT_CAPABILITIES },
  message: 'Not connected.',
  connected: false,
};

function normalizeBaseUrl(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (!/^https?:$/i.test(parsed.protocol)) return '';
    const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
    return `${parsed.protocol}//${parsed.host}${pathname}`.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function statusPayload(input: Partial<RepoAuthStatusPayload>): RepoAuthStatusPayload {
  return {
    ok: input.ok !== false,
    connected: input.connected === true,
    baseUrl: String(input.baseUrl || ''),
    provider: 'memory',
    lastValidatedAt: input.lastValidatedAt || null,
    capabilities: {
      connect: input.capabilities?.connect === true,
      read: input.capabilities?.read === true,
      write: input.capabilities?.write === true,
    },
    message: String(input.message || ''),
    ...(typeof input.status === 'number' ? { status: input.status } : {}),
    ...(input.authType ? { authType: input.authType } : {}),
    ...(typeof input.userId === 'number' ? { userId: input.userId } : {}),
    ...(typeof input.organizationId === 'number' ? { organizationId: input.organizationId } : {}),
    ...(Array.isArray(input.scopes) ? { scopes: input.scopes } : {}),
    ...(input.serverTime ? { serverTime: input.serverTime } : {}),
  };
}

export function getRepoAuthStatus(): RepoAuthStatusPayload {
  return statusPayload({
    ok: true,
    connected: runtimeState.connected,
    baseUrl: runtimeState.baseUrl,
    lastValidatedAt: runtimeState.lastValidatedAt,
    capabilities: runtimeState.capabilities,
    message: runtimeState.message || (runtimeState.connected ? 'Connected.' : 'Not connected.'),
  });
}

export function clearRepoAuthStatus() {
  runtimeState = {
    baseUrl: '',
    token: '',
    lastValidatedAt: null,
    capabilities: { ...DEFAULT_CAPABILITIES },
    message: 'Disconnected.',
    connected: false,
  };
  return getRepoAuthStatus();
}

export function connectRepoAuthStatus(input: { baseUrl: unknown; token: unknown }) {
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  const token = String(input.token || '').trim();
  if (!baseUrl) throw new Error('A valid base URL is required.');
  if (!token) throw new Error('A non-empty API key token is required.');

  runtimeState = {
    ...runtimeState,
    baseUrl,
    token,
    connected: true,
    message: 'Connected. Validation pending.',
  };
  return getRepoAuthStatus();
}

export async function validateRepoAuthStatus(input: { baseUrl?: unknown; token?: unknown } = {}) {
  const baseUrl = normalizeBaseUrl(
    typeof input.baseUrl === 'string' && input.baseUrl.trim().length > 0
      ? input.baseUrl
      : runtimeState.baseUrl,
  );
  const token = String(
    typeof input.token === 'string' && input.token.trim().length > 0
      ? input.token
      : runtimeState.token,
  ).trim();

  if (!baseUrl || !token) {
    runtimeState = {
      ...runtimeState,
      connected: false,
      capabilities: { ...DEFAULT_CAPABILITIES },
      message: 'No connection credentials configured.',
      lastValidatedAt: null,
    };
    return statusPayload({
      ...getRepoAuthStatus(),
      ok: false,
      status: 400,
      message: 'No connection credentials configured.',
    });
  }

  const endpoint = `${baseUrl}/api/repo-studio/desktop/connection`;
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-api-key': token,
      },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => null);
    const validatedAt = new Date().toISOString();
    const capabilities = {
      connect: payload?.capabilities?.connect === true,
      read: payload?.capabilities?.read === true,
      write: payload?.capabilities?.write === true,
    };

    runtimeState = {
      ...runtimeState,
      baseUrl,
      token,
      connected: response.ok,
      lastValidatedAt: validatedAt,
      capabilities: response.ok ? capabilities : { ...DEFAULT_CAPABILITIES },
      message: String(payload?.message || (response.ok ? 'Connection validated.' : `Validation failed (${response.status}).`)),
    };

    return statusPayload({
      ok: response.ok,
      connected: runtimeState.connected,
      baseUrl: runtimeState.baseUrl,
      lastValidatedAt: runtimeState.lastValidatedAt,
      capabilities: runtimeState.capabilities,
      message: runtimeState.message,
      status: response.status,
      authType: payload?.authType,
      userId: typeof payload?.userId === 'number' ? payload.userId : null,
      organizationId: typeof payload?.organizationId === 'number' ? payload.organizationId : null,
      scopes: Array.isArray(payload?.scopes) ? payload.scopes : [],
      serverTime: payload?.serverTime || null,
    });
  } catch (error) {
    runtimeState = {
      ...runtimeState,
      connected: false,
      baseUrl,
      token,
      lastValidatedAt: new Date().toISOString(),
      capabilities: { ...DEFAULT_CAPABILITIES },
      message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
    };
    return statusPayload({
      ok: false,
      connected: false,
      baseUrl,
      lastValidatedAt: runtimeState.lastValidatedAt,
      capabilities: runtimeState.capabilities,
      message: runtimeState.message,
      status: 503,
    });
  }
}

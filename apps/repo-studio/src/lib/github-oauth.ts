import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { getRepoStudioPayload } from '@/lib/payload-client';

const GITHUB_OAUTH_DEVICE_URL = 'https://github.com/login/device/code';
const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_USER_URL = 'https://api.github.com/user';
const INTEGRATIONS_COLLECTION = 'repo-integrations';

type IntegrationDoc = {
  id?: string;
  provider?: string;
  tokenCipher?: string;
  refreshTokenCipher?: string;
  expiresAtIso?: string;
  username?: string;
  host?: string;
  scopes?: string[] | string;
  authType?: string;
};

function resolveEncryptionSecret() {
  const explicit = String(process.env.REPO_STUDIO_TOKEN_ENCRYPTION_KEY || '').trim();
  if (explicit) return explicit;
  const fallback = String(process.env.REPO_STUDIO_PAYLOAD_SECRET || process.env.PAYLOAD_SECRET || '').trim();
  if (fallback) return fallback;
  return 'repo-studio-dev-secret-change-me';
}

function createKey() {
  return createHash('sha256').update(resolveEncryptionSecret()).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', createKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  });
}

function decrypt(value: string) {
  const parsed = JSON.parse(value) as { iv?: string; tag?: string; data?: string };
  const iv = Buffer.from(String(parsed.iv || ''), 'base64');
  const tag = Buffer.from(String(parsed.tag || ''), 'base64');
  const data = Buffer.from(String(parsed.data || ''), 'base64');
  const decipher = createDecipheriv('aes-256-gcm', createKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

function scopesFromHeader(headerValue: string | null) {
  return String(headerValue || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeScopes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((entry) => entry.trim()).filter(Boolean);
  }
  return [];
}

async function findGitHubIntegration() {
  const payload = await getRepoStudioPayload();
  const result = await payload.find({
    collection: INTEGRATIONS_COLLECTION,
    where: {
      provider: {
        equals: 'github',
      },
    },
    limit: 1,
  });
  return result?.docs?.[0] as IntegrationDoc | null;
}

async function saveGitHubIntegration(input: {
  accessToken: string;
  refreshToken?: string;
  expiresAtIso?: string;
  username: string;
  scopes: string[];
}) {
  const payload = await getRepoStudioPayload();
  const existing = await findGitHubIntegration();
  const data = {
    provider: 'github',
    tokenCipher: encrypt(input.accessToken),
    refreshTokenCipher: input.refreshToken ? encrypt(input.refreshToken) : '',
    expiresAtIso: input.expiresAtIso || '',
    username: input.username,
    host: 'github.com',
    scopes: input.scopes,
    authType: 'oauth-device',
  };
  if (existing?.id) {
    await payload.update({
      collection: INTEGRATIONS_COLLECTION,
      id: existing.id,
      data,
    });
    return;
  }
  await payload.create({
    collection: INTEGRATIONS_COLLECTION,
    data,
  });
}

export async function clearGitHubIntegration() {
  const payload = await getRepoStudioPayload();
  const existing = await findGitHubIntegration();
  if (!existing?.id) return;
  await payload.delete({
    collection: INTEGRATIONS_COLLECTION,
    id: existing.id,
  });
}

async function resolveGitHubAccessToken() {
  const integration = await findGitHubIntegration();
  if (!integration?.tokenCipher) return '';
  try {
    return decrypt(integration.tokenCipher);
  } catch {
    return '';
  }
}

export async function getGitHubAuthStatus() {
  const clientId = String(process.env.GITHUB_OAUTH_CLIENT_ID || '').trim();
  const integration = await findGitHubIntegration();
  const loggedIn = Boolean(integration?.tokenCipher);
  return {
    ok: true,
    github: {
      installed: true,
      configured: Boolean(clientId),
      loggedIn,
      username: loggedIn ? String(integration?.username || '') : '',
      host: String(integration?.host || 'github.com'),
      scopes: normalizeScopes(integration?.scopes),
      authType: String(integration?.authType || 'oauth-device'),
    },
    message: loggedIn ? `GitHub connected as ${String(integration?.username || 'unknown')}.` : 'GitHub not connected.',
  };
}

export async function startGitHubDeviceLogin() {
  const clientId = String(process.env.GITHUB_OAUTH_CLIENT_ID || '').trim();
  if (!clientId) {
    return {
      ok: false,
      message: 'Missing GITHUB_OAUTH_CLIENT_ID.',
      github: {
        installed: true,
        configured: false,
        loggedIn: false,
        username: '',
        host: 'github.com',
        scopes: [],
        authType: 'oauth-device',
      },
      authUrl: '',
      deviceCode: '',
      userCode: '',
      interval: 5,
      expiresIn: 0,
    };
  }

  const response = await fetch(GITHUB_OAUTH_DEVICE_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      scope: 'repo read:user',
    }),
  });

  const body = await response.json() as {
    device_code?: string;
    user_code?: string;
    verification_uri?: string;
    expires_in?: number;
    interval?: number;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !body.device_code || !body.user_code || !body.verification_uri) {
    return {
      ok: false,
      message: body.error_description || body.error || 'Unable to start GitHub device flow.',
      github: {
        installed: true,
        configured: true,
        loggedIn: false,
        username: '',
        host: 'github.com',
        scopes: [],
        authType: 'oauth-device',
      },
      authUrl: '',
      deviceCode: '',
      userCode: '',
      interval: 5,
      expiresIn: 0,
    };
  }

  return {
    ok: true,
    message: 'Open verification URL and enter the code to complete GitHub sign-in.',
    github: {
      installed: true,
      configured: true,
      loggedIn: false,
      username: '',
      host: 'github.com',
      scopes: [],
      authType: 'oauth-device',
    },
    authUrl: body.verification_uri,
    deviceCode: body.device_code,
    userCode: body.user_code,
    interval: Number(body.interval || 5),
    expiresIn: Number(body.expires_in || 600),
  };
}

export async function pollGitHubDeviceLogin(input: { deviceCode: string }) {
  const clientId = String(process.env.GITHUB_OAUTH_CLIENT_ID || '').trim();
  const deviceCode = String(input.deviceCode || '').trim();
  if (!clientId) {
    return {
      ok: false,
      pending: false,
      message: 'Missing GITHUB_OAUTH_CLIENT_ID.',
      github: {
        installed: true,
        configured: false,
        loggedIn: false,
        username: '',
        host: 'github.com',
        scopes: [],
        authType: 'oauth-device',
      },
    };
  }
  if (!deviceCode) {
    return {
      ok: false,
      pending: false,
      message: 'deviceCode is required.',
      github: {
        installed: true,
        configured: true,
        loggedIn: false,
        username: '',
        host: 'github.com',
        scopes: [],
        authType: 'oauth-device',
      },
    };
  }

  const response = await fetch(GITHUB_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }),
  });
  const body = await response.json() as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (body.error === 'authorization_pending' || body.error === 'slow_down') {
    const status = await getGitHubAuthStatus();
    return {
      ok: true,
      pending: true,
      message: 'Waiting for GitHub authorization...',
      github: status.github,
    };
  }
  if (!response.ok || !body.access_token) {
    const status = await getGitHubAuthStatus();
    return {
      ok: false,
      pending: false,
      message: body.error_description || body.error || 'GitHub device poll failed.',
      github: status.github,
    };
  }

  const userResponse = await fetch(GITHUB_API_USER_URL, {
    headers: {
      Authorization: `Bearer ${body.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'forge-repo-studio',
    },
  });
  if (!userResponse.ok) {
    return {
      ok: false,
      pending: false,
      message: 'GitHub login succeeded but user profile fetch failed.',
      github: {
        installed: true,
        configured: true,
        loggedIn: false,
        username: '',
        host: 'github.com',
        scopes: [],
        authType: 'oauth-device',
      },
    };
  }
  const user = await userResponse.json() as { login?: string };
  const username = String(user.login || '').trim();
  const scopes = scopesFromHeader(userResponse.headers.get('x-oauth-scopes'));
  const expiresAtIso = Number(body.expires_in || 0) > 0
    ? new Date(Date.now() + (Number(body.expires_in) * 1000)).toISOString()
    : '';

  await saveGitHubIntegration({
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAtIso,
    username,
    scopes,
  });

  const status = await getGitHubAuthStatus();
  return {
    ok: true,
    pending: false,
    message: `GitHub connected as ${username || 'unknown'}.`,
    github: status.github,
  };
}

export async function getGitHubAccessToken() {
  return resolveGitHubAccessToken();
}

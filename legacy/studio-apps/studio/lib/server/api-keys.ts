import 'server-only';

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Payload } from 'payload';
import {
  requireAuthenticatedUser,
  resolveOrganizationFromInput,
  type AuthenticatedUser,
} from '@/lib/server/organizations';

export const API_KEY_PREFIX = 'fga';

export const API_KEY_SCOPES = [
  'ai.*',
  'ai.chat',
  'ai.plan',
  'ai.structured',
  'ai.image',
  'repo-studio.*',
  'repo-studio.connect',
  'repo-studio.read',
  'repo-studio.write',
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export type ApiKeyUsageDelta = {
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  lastUsedIp?: string | null;
};

export type AiRequestAuthContext = {
  authType: 'session' | 'api_key';
  userId: number;
  organizationId: number | null;
  apiKeyId: number | null;
  scopes: ApiKeyScope[];
};

export type ScopedRequestAuthResult =
  | {
    ok: true;
    context: AiRequestAuthContext;
  }
  | {
    ok: false;
    status: 401 | 403;
    message: string;
  };

type ApiKeyDoc = {
  id: number;
  keyId: string;
  name?: string;
  user: number | { id?: number } | null;
  organization: number | { id?: number } | null;
  scopes?: string[] | string | null;
  secretSalt?: string | null;
  secretHash?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  requestCount?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalCostUsd?: number | null;
};

type ParsedApiKey = {
  keyId: string;
  secret: string;
};

export type GeneratedApiKeyMaterial = {
  key: string;
  keyId: string;
  keyPrefix: string;
  keyLast4: string;
  secretHash: string;
  secretSalt: string;
};

const API_KEY_TOKEN_PATTERN = /^fga_([a-f0-9]{16})_([A-Za-z0-9\-_]{24,256})$/;

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    const nested = (value as { id?: unknown }).id;
    return asNumericId(nested);
  }
  return null;
}

function normalizeScopes(value: unknown): ApiKeyScope[] {
  const asArray = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const unique = new Set<ApiKeyScope>();

  for (const raw of asArray) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim() as ApiKeyScope;
    if (API_KEY_SCOPES.includes(trimmed)) unique.add(trimmed);
  }

  return unique.size > 0 ? [...unique] : ['ai.*'];
}

function wildcardScopeFor(requiredScope: ApiKeyScope): ApiKeyScope | null {
  if (requiredScope.startsWith('ai.')) return 'ai.*';
  if (requiredScope.startsWith('repo-studio.')) return 'repo-studio.*';
  return null;
}

function hasScope(scopes: ApiKeyScope[], requiredScope: ApiKeyScope): boolean {
  if (scopes.includes(requiredScope)) return true;
  const wildcard = wildcardScopeFor(requiredScope);
  return wildcard ? scopes.includes(wildcard) : false;
}

function parseApiKey(token: string): ParsedApiKey | null {
  const trimmed = token.trim();
  const match = API_KEY_TOKEN_PATTERN.exec(trimmed);
  if (!match) return null;
  return {
    keyId: match[1],
    secret: match[2],
  };
}

function hashSecret(secret: string, saltHex: string): string {
  const derived = scryptSync(secret, Buffer.from(saltHex, 'hex'), 64);
  return derived.toString('hex');
}

function verifySecret(secret: string, saltHex: string, expectedHex: string): boolean {
  const expectedBuffer = Buffer.from(expectedHex, 'hex');
  const derivedBuffer = Buffer.from(hashSecret(secret, saltHex), 'hex');
  if (expectedBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(derivedBuffer, expectedBuffer);
}

function parseApiKeyFromHeaders(headers: Headers): string | null {
  const explicit = headers.get('x-api-key');
  if (explicit && explicit.trim().length > 0) return explicit.trim();

  const authorization = headers.get('authorization');
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  if (!match) return null;
  const token = match[1].trim();
  if (!token.startsWith(`${API_KEY_PREFIX}_`)) return null;
  return token;
}

export function getClientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp && realIp.trim().length > 0) return realIp.trim();
  return null;
}

export function generateApiKeyMaterial(): GeneratedApiKeyMaterial {
  const keyId = randomBytes(8).toString('hex');
  const secret = randomBytes(24).toString('base64url');
  const token = `${API_KEY_PREFIX}_${keyId}_${secret}`;
  const salt = randomBytes(16).toString('hex');
  const secretHash = hashSecret(secret, salt);
  return {
    key: token,
    keyId,
    keyPrefix: `${API_KEY_PREFIX}_${keyId}`,
    keyLast4: secret.slice(-4),
    secretHash,
    secretSalt: salt,
  };
}

export function sanitizeRequestedScopes(scopes: unknown): ApiKeyScope[] {
  return normalizeScopes(scopes);
}

async function findApiKeyByKeyId(payload: Payload, keyId: string): Promise<ApiKeyDoc | null> {
  const result = await payload.find({
    collection: 'api-keys',
    where: {
      keyId: {
        equals: keyId,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const first = result.docs[0];
  return (first as ApiKeyDoc | undefined) ?? null;
}

function isActiveKey(doc: ApiKeyDoc, now: Date): boolean {
  if (doc.revokedAt && new Date(doc.revokedAt).getTime() <= now.getTime()) return false;
  if (doc.expiresAt && new Date(doc.expiresAt).getTime() <= now.getTime()) return false;
  return true;
}

async function authenticateWithApiKeyTokenDetailed(
  payload: Payload,
  token: string,
  requiredScope?: ApiKeyScope,
): Promise<{ context: AiRequestAuthContext | null; failure: 'unauthorized' | 'forbidden' | null }> {
  const parsed = parseApiKey(token);
  if (!parsed) return { context: null, failure: 'unauthorized' };

  const doc = await findApiKeyByKeyId(payload, parsed.keyId);
  if (!doc) return { context: null, failure: 'unauthorized' };

  const secretSalt = typeof doc.secretSalt === 'string' ? doc.secretSalt : '';
  const secretHash = typeof doc.secretHash === 'string' ? doc.secretHash : '';
  if (!secretSalt || !secretHash) return { context: null, failure: 'unauthorized' };

  if (!verifySecret(parsed.secret, secretSalt, secretHash)) {
    return { context: null, failure: 'unauthorized' };
  }

  const now = new Date();
  if (!isActiveKey(doc, now)) return { context: null, failure: 'unauthorized' };

  const scopes = normalizeScopes(doc.scopes);
  if (requiredScope && !hasScope(scopes, requiredScope)) {
    return { context: null, failure: 'forbidden' };
  }

  const userId = asNumericId(doc.user);
  if (userId == null) return { context: null, failure: 'unauthorized' };
  const organizationId = asNumericId(doc.organization);
  if (organizationId == null) return { context: null, failure: 'unauthorized' };

  return {
    context: {
      authType: 'api_key',
      userId,
      organizationId,
      apiKeyId: doc.id,
      scopes,
    },
    failure: null,
  };
}

async function authenticateWithSession(
  payload: Payload,
  headers: Headers,
  requiredScope?: ApiKeyScope,
): Promise<AiRequestAuthContext | null> {
  const user: AuthenticatedUser | null = await requireAuthenticatedUser(payload, headers);
  if (!user) return null;
  const context = await resolveOrganizationFromInput(payload, user, null);
  const scopeFamily = requiredScope?.startsWith('repo-studio.') ? 'repo-studio.*' : 'ai.*';
  return {
    authType: 'session',
    userId: user.id,
    organizationId: context.activeOrganizationId ?? null,
    apiKeyId: null,
    scopes: [scopeFamily],
  };
}

export async function requireRequestAuth(
  payload: Payload,
  request: Request,
  requiredScope?: ApiKeyScope,
): Promise<ScopedRequestAuthResult> {
  const token = parseApiKeyFromHeaders(request.headers);
  if (token) {
    const detailed = await authenticateWithApiKeyTokenDetailed(payload, token, requiredScope);
    if (detailed.context) {
      return {
        ok: true,
        context: detailed.context,
      };
    }

    if (detailed.failure === 'forbidden') {
      return {
        ok: false,
        status: 403,
        message: requiredScope
          ? `Missing required scope: ${requiredScope}.`
          : 'Missing required scope.',
      };
    }

    return {
      ok: false,
      status: 401,
      message: 'Invalid or expired API key.',
    };
  }

  const session = await authenticateWithSession(payload, request.headers, requiredScope);
  if (!session) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized.',
    };
  }

  if (requiredScope && !hasScope(session.scopes, requiredScope)) {
    return {
      ok: false,
      status: 403,
      message: `Missing required scope: ${requiredScope}.`,
    };
  }

  return {
    ok: true,
    context: session,
  };
}

export async function requireAiRequestAuth(
  payload: Payload,
  request: Request,
  requiredScope?: ApiKeyScope,
): Promise<AiRequestAuthContext | null> {
  const auth = await requireRequestAuth(payload, request, requiredScope);
  return auth.ok ? auth.context : null;
}

export async function recordApiKeyUsage(
  payload: Payload,
  apiKeyId: number,
  delta: ApiKeyUsageDelta,
): Promise<void> {
  const doc = (await payload.findByID({
    collection: 'api-keys',
    id: apiKeyId,
    depth: 0,
    overrideAccess: true,
  })) as ApiKeyDoc | null;

  if (!doc) return;
  const nowIso = new Date().toISOString();

  await payload.update({
    collection: 'api-keys',
    id: apiKeyId,
    data: {
      lastUsedAt: nowIso,
      lastUsedIp: delta.lastUsedIp ?? undefined,
      requestCount: Math.max(0, Math.round(toFiniteNumber(doc.requestCount) + 1)),
      inputTokens: Math.max(
        0,
        Math.round(toFiniteNumber(doc.inputTokens) + Math.max(0, delta.inputTokens)),
      ),
      outputTokens: Math.max(
        0,
        Math.round(toFiniteNumber(doc.outputTokens) + Math.max(0, delta.outputTokens)),
      ),
      totalCostUsd:
        Math.round(
          (toFiniteNumber(doc.totalCostUsd) + Math.max(0, delta.totalCostUsd)) * 1_000_000,
        ) / 1_000_000,
    },
    overrideAccess: true,
  });
}

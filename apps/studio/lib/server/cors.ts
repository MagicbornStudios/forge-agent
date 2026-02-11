const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const ORIGIN_ENV_KEYS = [
  'CORS_ALLOWED_ORIGINS',
  'PLATFORM_APP_URL',
  'NEXT_PUBLIC_PLATFORM_APP_URL',
  'NEXT_PUBLIC_STUDIO_APP_URL',
  'NEXT_PUBLIC_APP_URL',
];

const DEFAULT_ALLOWED_HEADERS = 'Content-Type, Authorization';
const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
const PREFLIGHT_MAX_AGE_SECONDS = '86400';

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function splitOrigins(value: string): string[] {
  return value
    .split(',')
    .map((part) => normalizeOrigin(part))
    .filter((origin): origin is string => Boolean(origin));
}

export function getAllowedCorsOrigins(env: Record<string, string | undefined> = process.env): string[] {
  const origins = new Set(DEFAULT_ALLOWED_ORIGINS);

  for (const key of ORIGIN_ENV_KEYS) {
    const value = env[key];
    if (!value) continue;

    if (key === 'CORS_ALLOWED_ORIGINS') {
      for (const origin of splitOrigins(value)) {
        origins.add(origin);
      }
      continue;
    }

    const normalized = normalizeOrigin(value);
    if (normalized) {
      origins.add(normalized);
    }
  }

  return [...origins];
}

export function getAllowedOrigin(
  requestOrigin: string | null,
  allowedOrigins: string[] = getAllowedCorsOrigins(),
): string | null {
  if (!requestOrigin) return null;
  const normalized = normalizeOrigin(requestOrigin);
  if (!normalized) return null;
  return allowedOrigins.includes(normalized) ? normalized : null;
}

function appendVary(headers: Headers, value: string) {
  const current = headers.get('Vary');
  if (!current) {
    headers.set('Vary', value);
    return;
  }

  const parts = current
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.includes(value)) {
    parts.push(value);
    headers.set('Vary', parts.join(', '));
  }
}

export function setCorsHeaders(
  headers: Headers,
  origin: string,
  requestHeaders?: Headers,
) {
  const requestedHeaders = requestHeaders?.get('Access-Control-Request-Headers');

  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS);
  headers.set(
    'Access-Control-Allow-Headers',
    requestedHeaders?.trim() ? requestedHeaders : DEFAULT_ALLOWED_HEADERS,
  );
  headers.set('Access-Control-Max-Age', PREFLIGHT_MAX_AGE_SECONDS);
  appendVary(headers, 'Origin');
}

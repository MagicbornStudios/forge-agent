export const REPO_STUDIO_CREDENTIAL_SERVICE = 'forge-repo-studio';

export function normalizeBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (!/^https?:$/i.test(url.protocol)) return '';
    const pathname = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');
    const normalized = `${url.protocol}//${url.host}${pathname}`;
    return normalized.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function redactToken(value) {
  const token = String(value || '');
  if (!token) return '';
  if (token.length <= 6) return '***';
  return `${token.slice(0, 3)}***${token.slice(-3)}`;
}

export function toSafeMessage(input, fallback = 'Operation failed.') {
  if (input instanceof Error && input.message) return input.message;
  const text = String(input || '').trim();
  return text || fallback;
}

export function isNonEmptySecret(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

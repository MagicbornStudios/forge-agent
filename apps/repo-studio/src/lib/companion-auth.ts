/**
 * Companion mode: when another app (e.g. Studio) uses Repo Studio as its AI runtime,
 * we treat the request as a trusted caller and do not perform Payload user auth.
 * Used to decide whether to skip user lookup for assistant-chat and related routes.
 */

const COMPANION_ORIGINS_ENV = 'REPO_STUDIO_COMPANION_ORIGINS';
const COMPANION_SECRET_HEADER = 'x-forge-companion-secret';
const COMPANION_SECRET_ENV = 'REPO_STUDIO_COMPANION_SECRET';

function getAllowedOrigins(): Set<string> {
  const raw = process.env[COMPANION_ORIGINS_ENV]?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[,\s]+/)
      .map((o) => o.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Returns true when the request is from a trusted companion (e.g. Studio).
 * - Same-origin (no Origin header or Origin matches request host).
 * - Origin in REPO_STUDIO_COMPANION_ORIGINS (comma-separated, e.g. http://localhost:3000).
 * - Header x-forge-companion-secret matches REPO_STUDIO_COMPANION_SECRET.
 * When true, routes should not perform Payload user auth for this request.
 */
export function isCompanionRequest(request: Request): boolean {
  const secret = process.env[COMPANION_SECRET_ENV]?.trim();
  if (secret) {
    const headerSecret = request.headers.get(COMPANION_SECRET_HEADER)?.trim();
    if (headerSecret && headerSecret === secret) return true;
  }

  const origin = request.headers.get('origin')?.trim().toLowerCase();
  if (!origin) return true;

  try {
    const url = new URL(request.url);
    const requestHostOrigin = `${url.protocol}//${url.host}`.toLowerCase();
    if (origin === requestHostOrigin) return true;
  } catch {
    // ignore
  }

  const allowed = getAllowedOrigins();
  if (allowed.has(origin)) return true;

  return false;
}

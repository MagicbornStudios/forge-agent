const LOCAL_STUDIO_FALLBACK_URL = 'http://localhost:3000';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function isClientLocalHost(): boolean {
  if (typeof window === 'undefined') return false;
  return LOCAL_HOSTS.has(window.location.hostname);
}

function isRemoteRuntimeContext(): boolean {
  return (
    process.env.CI === 'true' ||
    process.env.VERCEL === '1' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV != null
  );
}

export function isLocalRuntimeFallbackAllowed(): boolean {
  if (typeof window !== 'undefined') {
    return isClientLocalHost();
  }

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return !isRemoteRuntimeContext();
}

export function resolveStudioAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_STUDIO_APP_URL?.trim();
  if (configured && configured.length > 0) {
    return trimTrailingSlash(configured);
  }

  if (isLocalRuntimeFallbackAllowed()) {
    return LOCAL_STUDIO_FALLBACK_URL;
  }

  throw new Error(
    'NEXT_PUBLIC_STUDIO_APP_URL is required outside local development runtime contexts. Run `pnpm env:setup --app platform`.',
  );
}


'use client';

import * as React from 'react';

const REPO_STUDIO_HEALTH_PATH = '/api/repo/health';
export const DEFAULT_REPO_STUDIO_BASE_URL = 'http://localhost:3010';

export function resolveCompanionRuntimeBaseUrl(baseUrl?: string | null): string | null {
  const explicit = typeof baseUrl === 'string' ? baseUrl.trim() : '';
  if (explicit) return explicit;

  const envUrl =
    typeof process.env.NEXT_PUBLIC_REPO_STUDIO_APP_URL === 'string'
      ? process.env.NEXT_PUBLIC_REPO_STUDIO_APP_URL.trim()
      : '';
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    return DEFAULT_REPO_STUDIO_BASE_URL;
  }

  return null;
}

export interface CompanionRuntimeDetectionResult {
  /** True when the companion (e.g. Repo Studio) health endpoint returned 200. */
  available: boolean;
  /** True while the health ping is in flight. */
  checking: boolean;
  /** Non-null when the last ping failed (network or non-2xx). */
  error: string | null;
}

/**
 * Pings a companion app's health endpoint to detect if it is available as an optional runtime.
 * Used by Studio (and other studios) to show an opt-in toggle to "Use Repo Studio for AI".
 * No auth required for the health endpoint.
 */
export function useCompanionRuntimeDetection(
  baseUrl: string | undefined | null,
): CompanionRuntimeDetectionResult {
  const resolvedBaseUrl = React.useMemo(
    () => resolveCompanionRuntimeBaseUrl(baseUrl),
    [baseUrl],
  );
  const [available, setAvailable] = React.useState(false);
  const [checking, setChecking] = React.useState(!!resolvedBaseUrl);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!resolvedBaseUrl || typeof resolvedBaseUrl !== 'string') {
      setAvailable(false);
      setChecking(false);
      setError(null);
      return;
    }

    const url = resolvedBaseUrl.replace(/\/$/, '') + REPO_STUDIO_HEALTH_PATH;
    setChecking(true);
    setError(null);

    const controller = new AbortController();
    fetch(url, { method: 'GET', signal: controller.signal, credentials: 'omit' })
      .then((res) => {
        setAvailable(res.ok);
        if (!res.ok) {
          setError(`${res.status} ${res.statusText}`);
        }
      })
      .catch((err) => {
        setAvailable(false);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setChecking(false);
      });

    return () => controller.abort();
  }, [resolvedBaseUrl]);

  return { available, checking, error };
}

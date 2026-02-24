'use client';

import * as React from 'react';

const REPO_STUDIO_HEALTH_PATH = '/api/repo/health';

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
  const [available, setAvailable] = React.useState(false);
  const [checking, setChecking] = React.useState(!!baseUrl);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!baseUrl || typeof baseUrl !== 'string') {
      setAvailable(false);
      setChecking(false);
      setError(null);
      return;
    }

    const url = baseUrl.replace(/\/$/, '') + REPO_STUDIO_HEALTH_PATH;
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
  }, [baseUrl]);

  return { available, checking, error };
}

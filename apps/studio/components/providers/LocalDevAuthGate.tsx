'use client';

import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '@/lib/data/keys';
import { isLocalDevAutoAdminEnabled } from '@/lib/feature-flags';
import { getLocalDevAutoAdminCredentials } from '@/lib/env';

type BootstrapState = 'checking' | 'ready' | 'error';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Local dev auth bootstrap failed.';
}

async function tryReadErrorBody(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown; message?: unknown };
    if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
      return payload.error;
    }
    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch {
    // Ignore JSON parse failures.
  }

  return `${response.status} ${response.statusText}`.trim();
}

async function ensureLocalAdminSession(): Promise<void> {
  const meResponse = await fetch('/api/me', {
    method: 'GET',
    credentials: 'include',
  });

  if (meResponse.ok) {
    return;
  }

  if (meResponse.status !== 401) {
    const details = await tryReadErrorBody(meResponse);
    throw new Error(`GET /api/me failed before bootstrap: ${details}`);
  }

  const { email, password } = getLocalDevAutoAdminCredentials();

  const loginResponse = await fetch('/api/users/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!loginResponse.ok) {
    const details = await tryReadErrorBody(loginResponse);
    throw new Error(`POST /api/users/login failed: ${details}`);
  }
}

export function LocalDevAuthGate({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = React.useState<BootstrapState>('checking');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [retryToken, setRetryToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isLocalDevAutoAdminEnabled()) {
        if (!cancelled) {
          setState('ready');
        }
        return;
      }

      if (!cancelled) {
        setState('checking');
        setErrorMessage(null);
      }

      try {
        await ensureLocalAdminSession();
        await queryClient.invalidateQueries({ queryKey: authKeys.me() });
        if (!cancelled) {
          setState('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setState('error');
          setErrorMessage(getErrorMessage(error));
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [queryClient, retryToken]);

  if (state === 'ready') {
    return <>{children}</>;
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-lg border bg-background p-5 text-sm">
          <h2 className="text-base font-semibold">Local dev auto-admin login failed</h2>
          <p className="mt-2 text-muted-foreground">
            Studio could not bootstrap a local authenticated session. Update local env values and
            retry.
          </p>
          <p className="mt-3 rounded border bg-muted px-3 py-2 font-mono text-xs">
            {errorMessage ?? 'Unknown bootstrap error.'}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Required envs: <code>NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN=1</code>,{' '}
            <code>NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN_EMAIL</code>,{' '}
            <code>NEXT_PUBLIC_LOCAL_DEV_AUTO_ADMIN_PASSWORD</code>.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Quick fix: <code>pnpm env:setup --app studio</code>
          </p>
          <div className="mt-4">
            <button
              type="button"
              className="rounded border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              onClick={() => setRetryToken((value) => value + 1)}
            >
              Retry local login bootstrap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[30vh] items-center justify-center p-4 text-sm text-muted-foreground">
      Initializing local development session...
    </div>
  );
}

import { resolveStudioAppUrl } from '@/lib/env';

export class StudioApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'StudioApiError';
    this.status = status;
    this.details = details;
  }
}

type RequestMethod = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
type QueryParamValue = string | number | boolean | null | undefined;

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getStudioApiUrl(): string {
  return trimTrailingSlash(resolveStudioAppUrl());
}

function withQuery(path: string, query?: Record<string, QueryParamValue>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString.length === 0 ? path : `${path}?${queryString}`;
}

function buildUrl(path: string, query?: Record<string, QueryParamValue>): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullPath = withQuery(normalizedPath, query);
  return `${resolveStudioAppUrl()}${fullPath}`;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function defaultErrorMessage(method: string, path: string): string {
  return `${method} ${path} failed`;
}

export type RequestJsonOptions = {
  path: string;
  method?: RequestMethod;
  body?: unknown;
  query?: Record<string, QueryParamValue>;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  headers?: HeadersInit;
};

export async function requestJson<T>({
  path,
  method = 'GET',
  body,
  query,
  credentials = 'include',
  cache,
  headers,
}: RequestJsonOptions): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    method,
    credentials,
    cache,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    const errorMessage =
      (payload as { error?: unknown; message?: unknown; errors?: Array<{ message?: unknown }> } | null)
        ?.error ??
      (payload as { error?: unknown; message?: unknown; errors?: Array<{ message?: unknown }> } | null)
        ?.message ??
      (payload as { error?: unknown; message?: unknown; errors?: Array<{ message?: unknown }> } | null)
        ?.errors?.[0]?.message;

    throw new StudioApiError(
      typeof errorMessage === 'string' && errorMessage.length > 0
        ? errorMessage
        : defaultErrorMessage(method, path),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export async function requestNoContent({
  path,
  method = 'POST',
  body,
  query,
  credentials = 'include',
  headers,
}: RequestJsonOptions): Promise<void> {
  const response = await fetch(buildUrl(path, query), {
    method,
    credentials,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await parseJsonSafe(response);
    const errorMessage =
      (payload as { error?: unknown; message?: unknown; errors?: Array<{ message?: unknown }> } | null)
        ?.error ??
      (payload as { error?: unknown; message?: unknown; errors?: Array<{ message?: unknown }> } | null)
        ?.message ??
      (payload as { error?: unknown; message?: unknown; errors?: Array<{ message?: unknown }> } | null)
        ?.errors?.[0]?.message;

    throw new StudioApiError(
      typeof errorMessage === 'string' && errorMessage.length > 0
        ? errorMessage
        : defaultErrorMessage(method, path),
      response.status,
      payload,
    );
  }
}

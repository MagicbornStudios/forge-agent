export class ApiRequestError extends Error {
  readonly status: number;
  readonly payload: unknown;
  readonly url: string;

  constructor(input: { message: string; status: number; payload: unknown; url: string }) {
    super(input.message);
    this.name = 'ApiRequestError';
    this.status = input.status;
    this.payload = input.payload;
    this.url = input.url;
  }
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function messageFromPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return '';
  const candidate = payload as Record<string, unknown>;
  const message = String(
    candidate.message
      || candidate.error
      || candidate.stderr
      || '',
  ).trim();
  return message;
}

function toRequestError(input: { response: Response; payload: unknown; fallback: string; url: string }) {
  const payloadMessage = messageFromPayload(input.payload);
  const message = payloadMessage || `${input.fallback} (${input.response.status})`;
  return new ApiRequestError({
    message,
    status: input.response.status,
    payload: input.payload,
    url: input.url,
  });
}

export async function requestJson<T>(
  url: string,
  init: RequestInit & { fallbackMessage?: string; timeoutMs?: number } = {},
): Promise<T> {
  const fallbackMessage = String(init.fallbackMessage || 'Request failed');
  const timeoutMs = Number(init.timeoutMs || 20000);
  const timeoutSignal = !init.signal && Number.isFinite(timeoutMs) && timeoutMs > 0
    ? AbortSignal.timeout(timeoutMs)
    : undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: init.signal || timeoutSignal,
      headers: {
        'content-type': 'application/json',
        ...(init.headers || {}),
      },
    });
  } catch (error: unknown) {
    const aborted = error && typeof error === 'object' && (
      (error as { name?: string }).name === 'AbortError'
      || (error as { name?: string }).name === 'TimeoutError'
    );
    if (aborted) {
      throw new ApiRequestError({
        message: `${fallbackMessage} (timed out after ${timeoutMs}ms)`,
        status: 408,
        payload: null,
        url,
      });
    }
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError({
      message: toErrorMessage(error, fallbackMessage),
      status: 0,
      payload: null,
      url,
    });
  }

  const payload = await parseJson(response);
  if (!response.ok) {
    throw toRequestError({
      response,
      payload,
      fallback: fallbackMessage,
      url,
    });
  }
  return payload as T;
}

export async function getJson<T>(url: string, init: RequestInit & { fallbackMessage?: string; timeoutMs?: number } = {}) {
  return requestJson<T>(url, {
    ...init,
    method: init.method || 'GET',
  });
}

export async function postJson<T>(
  url: string,
  body: unknown,
  init: RequestInit & { fallbackMessage?: string; timeoutMs?: number } = {},
) {
  return requestJson<T>(url, {
    ...init,
    method: init.method || 'POST',
    body: JSON.stringify(body ?? {}),
  });
}

export function toErrorMessage(error: unknown, fallback = 'Request failed.') {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  const text = String(error || '').trim();
  return text || fallback;
}

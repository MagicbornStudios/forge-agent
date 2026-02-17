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
  init: RequestInit & { fallbackMessage?: string } = {},
): Promise<T> {
  const fallbackMessage = String(init.fallbackMessage || 'Request failed');
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
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

export async function getJson<T>(url: string, init: RequestInit & { fallbackMessage?: string } = {}) {
  return requestJson<T>(url, {
    ...init,
    method: init.method || 'GET',
  });
}

export async function postJson<T>(
  url: string,
  body: unknown,
  init: RequestInit & { fallbackMessage?: string } = {},
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


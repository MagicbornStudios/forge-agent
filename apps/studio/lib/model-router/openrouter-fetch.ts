/**
 * Wraps fetch to inject OpenRouter model fallbacks (models array) into request body.
 * OpenRouter tries the next model in the array on rate limit / 5xx.
 * @see https://openrouter.ai/docs/guides/routing/model-fallbacks
 */
export function createFetchWithModelFallbacks(
  primary: string,
  fallbacks: string[],
  baseUrl: string,
  baseFetch: typeof fetch = fetch,
): typeof fetch {
  const models = [primary, ...fallbacks];
  const baseOrigin = new URL(baseUrl).origin;

  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const parsed = new URL(url);
    if (parsed.origin !== baseOrigin || !parsed.pathname.includes('chat/completions')) {
      return baseFetch(input, init);
    }
    if (!init?.body) return baseFetch(input, init);
    try {
      const body = JSON.parse(init.body as string) as Record<string, unknown>;
      body.models = models;
      return baseFetch(input, { ...init, body: JSON.stringify(body) });
    } catch {
      return baseFetch(input, init);
    }
  };
}

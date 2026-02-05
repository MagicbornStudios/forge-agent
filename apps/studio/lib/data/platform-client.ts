/**
 * Fetchers for platform-related Next API routes (pricing, etc.).
 * Today may still hit the same server; multi-backend ready.
 */

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.text();
    let message = `Request failed: ${res.status}`;
    try {
      const data = JSON.parse(body);
      if (data?.error) message = data.error;
    } catch {
      if (body) message = body.slice(0, 200);
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const platformClient = {
  // getPricing: () => fetchJson<unknown>('/api/pricing'),
};

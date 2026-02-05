const STUDIO_API_URL = process.env.NEXT_PUBLIC_STUDIO_APP_URL || 'http://localhost:3000';

export function getStudioApiUrl(): string {
  return STUDIO_API_URL;
}

export type MeResponse = {
  user: { id: string | number; email?: string | null; name?: string | null; role?: string | null; plan?: string | null } | null;
};

export async function fetchMe(credentials: RequestCredentials = 'include'): Promise<MeResponse> {
  const res = await fetch(`${STUDIO_API_URL}/api/me`, { credentials });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch user');
  return data;
}

export async function login(email: string, password: string): Promise<{ user: unknown }> {
  const res = await fetch(`${STUDIO_API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.errors?.[0]?.message || data?.message || 'Login failed');
  return data;
}

export async function submitWaitlist(body: { email: string; name?: string; source?: string }): Promise<void> {
  const res = await fetch(`${STUDIO_API_URL}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to join waitlist');
  }
}

export async function submitNewsletter(body: { email: string; optedIn?: boolean; source?: string }): Promise<void> {
  const res = await fetch(`${STUDIO_API_URL}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to subscribe');
  }
}

export async function fetchPromotions(): Promise<
  { id: string | number; title: string; body?: unknown; ctaUrl?: string }[]
> {
  const res = await fetch(`${STUDIO_API_URL}/api/promotions`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.promotions ?? [];
}

export async function createCheckoutSession(successUrl?: string, cancelUrl?: string): Promise<{ url?: string }> {
  const res = await fetch(`${STUDIO_API_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ successUrl, cancelUrl }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to create checkout session');
  return data;
}

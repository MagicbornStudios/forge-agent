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

export type PostListItem = {
  id: string | number;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
};

export type PostDetail = PostListItem & {
  body?: unknown;
};

export async function fetchPosts(): Promise<PostListItem[]> {
  const res = await fetch(`${STUDIO_API_URL}/api/posts`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.posts ?? [];
}

export async function fetchPostBySlug(slug: string): Promise<PostDetail | null> {
  const res = await fetch(`${STUDIO_API_URL}/api/posts?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.post ?? null;
}

export type CatalogListing = {
  id: string | number;
  title: string;
  slug: string;
  description?: string;
  listingType: 'project' | 'template' | 'strategy-core';
  price: number;
  currency: string;
  category?: string;
  thumbnailUrl?: string;
  creatorName?: string;
};

export async function fetchListings(): Promise<CatalogListing[]> {
  const res = await fetch(`${STUDIO_API_URL}/api/catalog`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.listings ?? [];
}

export async function fetchListingBySlug(slug: string): Promise<CatalogListing | null> {
  const res = await fetch(`${STUDIO_API_URL}/api/catalog?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.listing ?? null;
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

export type CreateListingCheckoutOptions = {
  successUrl?: string;
  cancelUrl?: string;
  baseUrl?: string;
};

export async function createListingCheckoutSession(
  listingId: number,
  options?: CreateListingCheckoutOptions
): Promise<{ url?: string }> {
  const res = await fetch(`${STUDIO_API_URL}/api/stripe/connect/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listingId,
      successUrl: options?.successUrl,
      cancelUrl: options?.cancelUrl,
      baseUrl: options?.baseUrl,
    }),
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to create checkout session');
  return data;
}

export type CheckoutSessionResult = {
  clonedProjectId: number | null;
  listingTitle: string | null;
  listingId: number;
};

export async function fetchCheckoutSessionResult(
  sessionId: string,
  credentials: RequestCredentials = 'include'
): Promise<CheckoutSessionResult | null> {
  const res = await fetch(
    `${STUDIO_API_URL}/api/checkout/session-result?session_id=${encodeURIComponent(sessionId)}`,
    { credentials }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data as CheckoutSessionResult;
}

export type LicenseItem = {
  id: number;
  listingTitle: string | null;
  grantedAt: string | null;
  clonedProjectId: number | null;
};

export type FetchLicensesResponse = {
  licenses: LicenseItem[];
};

export async function fetchLicenses(
  credentials: RequestCredentials = 'include'
): Promise<LicenseItem[]> {
  const res = await fetch(`${STUDIO_API_URL}/api/licenses`, { credentials });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to fetch licenses');
  }
  const data: FetchLicensesResponse = await res.json();
  return data?.licenses ?? [];
}

export async function cloneAgain(
  licenseId: number,
  credentials: RequestCredentials = 'include'
): Promise<{ projectId: number }> {
  const res = await fetch(`${STUDIO_API_URL}/api/licenses/${licenseId}/clone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    credentials,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Clone again failed');
  return data as { projectId: number };
}

const STUDIO_API_URL = process.env.NEXT_PUBLIC_STUDIO_APP_URL || 'http://localhost:3000';

export function getStudioApiUrl(): string {
  return STUDIO_API_URL;
}

export type MeResponse = {
  user: {
    id: string | number;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    plan?: string | null;
    defaultOrganizationId?: number | null;
    stripeConnectAccountId?: string | null;
  } | null;
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

export async function submitNewsletter(body: {
  email: string;
  optedIn?: boolean;
  source?: string;
}): Promise<void> {
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
  cloneMode?: 'indefinite' | 'version-only';
  price: number;
  currency: string;
  category?: string;
  playUrl?: string;
  updatedAt?: string;
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

export type CloneListingResponse = {
  projectId: number;
  licenseId: number | null;
  listingId: number;
  listingTitle: string;
  mode: 'free';
};

export async function cloneFreeListing(listingId: number): Promise<CloneListingResponse> {
  const res = await fetch(`${STUDIO_API_URL}/api/catalog/${listingId}/clone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to clone listing');
  return data as CloneListingResponse;
}

export type CreatorListing = {
  id: number;
  title: string;
  slug: string;
  listingType: 'project' | 'template' | 'strategy-core';
  status: 'draft' | 'published';
  cloneMode: 'indefinite' | 'version-only';
  price: number;
  currency: string;
  category?: string;
  playUrl?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
  projectId?: number | null;
  projectTitle?: string | null;
  organizationId?: number | null;
};

export async function fetchMyListings(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<CreatorListing[]> {
  const query = orgId != null ? `?orgId=${encodeURIComponent(String(orgId))}` : '';
  const res = await fetch(`${STUDIO_API_URL}/api/me/listings${query}`, { credentials });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch listings');
  return (data?.listings ?? []) as CreatorListing[];
}

export type CreatorProject = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  status?: string | null;
  domain?: string | null;
  updatedAt?: string;
  listing?: {
    id: number;
    slug: string;
    title: string;
    status: 'draft' | 'published';
    price: number;
    currency: string;
    cloneMode: 'indefinite' | 'version-only';
    playUrl?: string;
  } | null;
};

export async function fetchMyProjects(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<CreatorProject[]> {
  const query = orgId != null ? `?orgId=${encodeURIComponent(String(orgId))}` : '';
  const res = await fetch(`${STUDIO_API_URL}/api/me/projects${query}`, { credentials });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch projects');
  return (data?.projects ?? []) as CreatorProject[];
}

export type RevenueSummary = {
  totalEarningsCents: number;
  totalPlatformFeesCents: number;
  byLicense: {
    licenseId: number;
    listingTitle: string;
    amountCents: number;
    platformFeeCents: number;
    grantedAt?: string | null;
  }[];
};

export async function fetchRevenueSummary(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<RevenueSummary> {
  const query = orgId != null ? `?orgId=${encodeURIComponent(String(orgId))}` : '';
  const res = await fetch(`${STUDIO_API_URL}/api/me/revenue${query}`, { credentials });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch revenue');
  return data as RevenueSummary;
}

export async function createConnectAccount(
  orgId?: number | null,
): Promise<{ accountId: string; organizationId?: number }> {
  const res = await fetch(`${STUDIO_API_URL}/api/stripe/connect/create-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orgId != null ? { orgId } : {}),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to create payouts account');
  return data as { accountId: string; organizationId?: number };
}

export type CreateOnboardingLinkOptions = {
  orgId?: number | null;
  baseUrl?: string;
  returnUrl?: string;
  refreshUrl?: string;
};

export async function createConnectOnboardingLink(
  options?: CreateOnboardingLinkOptions,
): Promise<{ url: string }> {
  const res = await fetch(`${STUDIO_API_URL}/api/stripe/connect/onboarding-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options ?? {}),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to create onboarding link');
  return data as { url: string };
}

export type OrganizationMembership = {
  organizationId: number;
  organizationName: string;
  organizationSlug: string;
  role: 'owner' | 'member';
  stripeConnectAccountId?: string | null;
  stripeConnectOnboardingComplete?: boolean | null;
};

export type OrganizationsResponse = {
  activeOrganizationId: number;
  activeOrganization: OrganizationMembership | null;
  memberships: OrganizationMembership[];
};

export async function fetchOrganizations(
  credentials: RequestCredentials = 'include',
): Promise<OrganizationsResponse> {
  const res = await fetch(`${STUDIO_API_URL}/api/me/orgs`, { credentials });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch organizations');
  return data as OrganizationsResponse;
}

export async function setActiveOrganization(
  organizationId: number,
  credentials: RequestCredentials = 'include',
): Promise<OrganizationsResponse> {
  const res = await fetch(`${STUDIO_API_URL}/api/me/orgs/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId }),
    credentials,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to switch organization');
  return data as OrganizationsResponse;
}

export type AiUsageRange = '7d' | '30d' | '90d';

export type AiUsageSeriesRow = {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  count: number;
};

export type AiUsageSeriesResponse = {
  range: AiUsageRange;
  activeOrganizationId: number;
  series: AiUsageSeriesRow[];
};

export async function fetchAiUsageSeries(
  options?: { orgId?: number | null; range?: AiUsageRange },
  credentials: RequestCredentials = 'include',
): Promise<AiUsageSeriesResponse> {
  const params = new URLSearchParams();
  if (options?.range) params.set('range', options.range);
  if (options?.orgId != null) params.set('orgId', String(options.orgId));
  const query = params.toString();
  const res = await fetch(
    `${STUDIO_API_URL}/api/me/ai-usage${query ? `?${query}` : ''}`,
    { credentials },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch AI usage');
  return data as AiUsageSeriesResponse;
}

export type AiUsageSummaryResponse = {
  range: AiUsageRange;
  activeOrganizationId: number;
  summary: {
    requestCount: number;
    successfulRequests: number;
    failedRequests: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    totalCostUsd: number;
  };
  topModels: Array<{
    model: string;
    totalTokens: number;
    totalCostUsd: number;
  }>;
};

export async function fetchAiUsageSummary(
  options?: { orgId?: number | null; range?: AiUsageRange },
  credentials: RequestCredentials = 'include',
): Promise<AiUsageSummaryResponse> {
  const params = new URLSearchParams();
  if (options?.range) params.set('range', options.range);
  if (options?.orgId != null) params.set('orgId', String(options.orgId));
  const query = params.toString();
  const res = await fetch(
    `${STUDIO_API_URL}/api/me/ai-usage/summary${query ? `?${query}` : ''}`,
    { credentials },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to fetch AI usage summary');
  return data as AiUsageSummaryResponse;
}

export type ApiKeyScope = 'ai.*' | 'ai.chat' | 'ai.plan' | 'ai.structured' | 'ai.image';

export type ApiKeyRecord = {
  id: number;
  name: string;
  keyPrefix: string;
  keyLast4: string;
  scopes: ApiKeyScope[];
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  lastUsedAt: string | null;
};

export type ApiKeyListResponse = {
  activeOrganizationId: number;
  apiKeys: ApiKeyRecord[];
};

export async function fetchApiKeys(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<ApiKeyListResponse> {
  const params = new URLSearchParams();
  if (orgId != null) params.set('orgId', String(orgId));
  const query = params.toString();
  const res = await fetch(`${STUDIO_API_URL}/api/me/api-keys${query ? `?${query}` : ''}`, {
    credentials,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to load API keys');
  return data as ApiKeyListResponse;
}

export type CreateApiKeyInput = {
  name: string;
  scopes?: ApiKeyScope[];
  expiresAt?: string | null;
  organizationId?: number | null;
};

export type CreateApiKeyResponse = {
  activeOrganizationId: number;
  apiKey: string;
  warning: string;
  created: ApiKeyRecord;
};

export async function createApiKey(
  input: CreateApiKeyInput,
  credentials: RequestCredentials = 'include',
): Promise<CreateApiKeyResponse> {
  const res = await fetch(`${STUDIO_API_URL}/api/me/api-keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    credentials,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to create API key');
  return data as CreateApiKeyResponse;
}

export async function revokeApiKey(
  id: number,
  reason?: string,
  credentials: RequestCredentials = 'include',
): Promise<{ ok: boolean }> {
  const res = await fetch(`${STUDIO_API_URL}/api/me/api-keys/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reason ? { reason } : {}),
    credentials,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Failed to revoke API key');
  return { ok: true };
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
  options?: CreateListingCheckoutOptions,
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
  credentials: RequestCredentials = 'include',
): Promise<CheckoutSessionResult | null> {
  const res = await fetch(
    `${STUDIO_API_URL}/api/checkout/session-result?session_id=${encodeURIComponent(sessionId)}`,
    { credentials },
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

export async function fetchLicenses(credentials: RequestCredentials = 'include'): Promise<LicenseItem[]> {
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
  credentials: RequestCredentials = 'include',
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

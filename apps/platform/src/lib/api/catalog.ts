import { requestJson } from './client';
import type {
  CatalogListing,
  CloneListingResponse,
  CreateListingCheckoutOptions,
  CreatorListing,
  CreatorProject,
} from './types';

export async function fetchListings(): Promise<CatalogListing[]> {
  try {
    const data = await requestJson<{ listings?: CatalogListing[] }>({
      path: '/api/catalog',
      cache: 'no-store',
      credentials: 'omit',
    });
    return data.listings ?? [];
  } catch {
    return [];
  }
}

export async function fetchListingBySlug(slug: string): Promise<CatalogListing | null> {
  try {
    const data = await requestJson<{ listing?: CatalogListing | null }>({
      path: '/api/catalog',
      query: { slug },
      cache: 'no-store',
      credentials: 'omit',
    });
    return data.listing ?? null;
  } catch {
    return null;
  }
}

export async function cloneFreeListing(listingId: number): Promise<CloneListingResponse> {
  return requestJson<CloneListingResponse>({
    path: `/api/catalog/${listingId}/clone`,
    method: 'POST',
    body: {},
    credentials: 'include',
  });
}

export async function fetchMyListings(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<CreatorListing[]> {
  const data = await requestJson<{ listings?: CreatorListing[] }>({
    path: '/api/me/listings',
    query: { orgId: orgId ?? undefined },
    credentials,
  });
  return data.listings ?? [];
}

export async function fetchMyProjects(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<CreatorProject[]> {
  const data = await requestJson<{ projects?: CreatorProject[] }>({
    path: '/api/me/projects',
    query: { orgId: orgId ?? undefined },
    credentials,
  });
  return data.projects ?? [];
}

export async function createListingCheckoutSession(
  listingId: number,
  options?: CreateListingCheckoutOptions,
): Promise<{ url?: string }> {
  return requestJson<{ url?: string }>({
    path: '/api/stripe/connect/create-checkout-session',
    method: 'POST',
    credentials: 'include',
    body: {
      listingId,
      successUrl: options?.successUrl,
      cancelUrl: options?.cancelUrl,
      baseUrl: options?.baseUrl,
    },
  });
}

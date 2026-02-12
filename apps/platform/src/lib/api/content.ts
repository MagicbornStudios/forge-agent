import { requestJson } from './client';
import type { PostDetail, PostListItem } from './types';

export async function submitWaitlist(body: {
  email: string;
  name?: string;
  source?: string;
}): Promise<void> {
  await requestJson<unknown>({
    path: '/api/waitlist',
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

export async function submitNewsletter(body: {
  email: string;
  optedIn?: boolean;
  source?: string;
}): Promise<void> {
  await requestJson<unknown>({
    path: '/api/newsletter',
    method: 'POST',
    body,
    credentials: 'omit',
  });
}

export async function fetchPromotions(): Promise<
  { id: string | number; title: string; body?: unknown; ctaUrl?: string }[]
> {
  try {
    const data = await requestJson<{ promotions?: { id: string | number; title: string; body?: unknown; ctaUrl?: string }[] }>({
      path: '/api/promotions',
      cache: 'no-store',
      credentials: 'omit',
    });
    return data.promotions ?? [];
  } catch {
    return [];
  }
}

export async function fetchPosts(): Promise<PostListItem[]> {
  try {
    const data = await requestJson<{ posts?: PostListItem[] }>({
      path: '/api/posts',
      cache: 'no-store',
      credentials: 'omit',
    });
    return data.posts ?? [];
  } catch {
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<PostDetail | null> {
  try {
    const data = await requestJson<{ post?: PostDetail | null }>({
      path: '/api/posts',
      query: { slug },
      cache: 'no-store',
      credentials: 'omit',
    });
    return data.post ?? null;
  } catch {
    return null;
  }
}

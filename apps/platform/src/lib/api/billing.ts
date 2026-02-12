import { requestJson } from './client';
import type {
  CheckoutSessionResult,
  CreateOnboardingLinkOptions,
  RevenueSummary,
} from './types';

export async function fetchRevenueSummary(
  orgId?: number | null,
  credentials: RequestCredentials = 'include',
): Promise<RevenueSummary> {
  return requestJson<RevenueSummary>({
    path: '/api/me/revenue',
    query: { orgId: orgId ?? undefined },
    credentials,
  });
}

export async function createConnectAccount(
  orgId?: number | null,
): Promise<{ accountId: string; organizationId?: number }> {
  return requestJson<{ accountId: string; organizationId?: number }>({
    path: '/api/stripe/connect/create-account',
    method: 'POST',
    credentials: 'include',
    body: orgId != null ? { orgId } : {},
  });
}

export async function createConnectOnboardingLink(
  options?: CreateOnboardingLinkOptions,
): Promise<{ url: string }> {
  return requestJson<{ url: string }>({
    path: '/api/stripe/connect/onboarding-link',
    method: 'POST',
    credentials: 'include',
    body: options ?? {},
  });
}

export async function createCheckoutSession(options?: {
  successUrl?: string;
  cancelUrl?: string;
  orgId?: number | null;
}): Promise<{ url?: string }> {
  return requestJson<{ url?: string }>({
    path: '/api/stripe/create-checkout-session',
    method: 'POST',
    credentials: 'include',
    body: options ?? {},
  });
}

export async function fetchCheckoutSessionResult(
  sessionId: string,
  credentials: RequestCredentials = 'include',
): Promise<CheckoutSessionResult | null> {
  try {
    return await requestJson<CheckoutSessionResult>({
      path: '/api/checkout/session-result',
      query: { session_id: sessionId },
      credentials,
    });
  } catch {
    return null;
  }
}

'use client';

import { isLocalDevAutoAdminEnabled as isLocalDevAutoAdminEnabledForHost } from '@/lib/env';

/**
 * Feature flags (PostHog). Strategy editor removed; chat is in the right-rail Chat panel only.
 * CopilotKit fully removed; Assistant UI is the chat surface.
 */

export function isLocalDevAutoAdminEnabled(): boolean {
  const host = typeof window !== 'undefined' ? window.location.hostname : undefined;
  return isLocalDevAutoAdminEnabledForHost(host);
}

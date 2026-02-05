'use client';

import * as React from 'react';
import type { CapabilityId } from './capabilities';
import type { EntitlementInfo, EntitlementsContextValue } from './types';

const fallback: EntitlementsContextValue = {
  has: () => true,
  get: (capability: CapabilityId): EntitlementInfo => ({
    capability,
    status: 'allowed',
  }),
};

const EntitlementsContext = React.createContext<EntitlementsContextValue | null>(null);

export function EntitlementsProvider({
  value,
  children,
}: {
  value: EntitlementsContextValue;
  children: React.ReactNode;
}) {
  return <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>;
}

export function useEntitlements() {
  const ctx = React.useContext(EntitlementsContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Entitlements] Provider missing; defaulting to allow all.');
    }
    return fallback;
  }
  return ctx;
}

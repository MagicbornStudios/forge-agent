'use client';

import * as React from 'react';
import type { CapabilityId } from '@forge/shared/entitlements/capabilities';
import type { EntitlementsContextValue } from '@forge/shared/entitlements/types';
import { EntitlementsProvider as SharedEntitlementsProvider } from '@forge/shared/entitlements/context';
import { useEntitlementsStore } from '@/lib/entitlements/store';
import { usePaywallStore } from '@/lib/entitlements/paywall';
import { PaywallSheet } from '@/components/paywall/PaywallSheet';

export function EntitlementsProvider({ children }: { children: React.ReactNode }) {
  const plan = useEntitlementsStore((s) => s.plan);
  const getStatus = useEntitlementsStore((s) => s.getStatus);
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  const value = React.useMemo<EntitlementsContextValue>(
    () => ({
      has: (capability: CapabilityId) => getStatus(capability) === 'allowed',
      get: (capability: CapabilityId) => {
        const status = getStatus(capability);
        const requiredPlan = status === 'allowed' ? undefined : plan === 'free' ? 'pro' : undefined;
        return {
          capability,
          status,
          reason: status === 'allowed' ? undefined : 'Upgrade to unlock this feature.',
          requiredPlan,
        };
      },
      openPaywall: (capability, info) => openPaywall({ capability, info }),
    }),
    [getStatus, openPaywall, plan],
  );

  return (
    <SharedEntitlementsProvider value={value}>
      {children}
      <PaywallSheet />
    </SharedEntitlementsProvider>
  );
}

import { create } from 'zustand';
import type { CapabilityId } from '@forge/shared/entitlements/capabilities';
import type { EntitlementInfo } from '@forge/shared/entitlements/types';

interface PaywallState {
  open: boolean;
  capability?: CapabilityId;
  info?: EntitlementInfo;
  openPaywall: (payload?: { capability?: CapabilityId; info?: EntitlementInfo }) => void;
  closePaywall: () => void;
}

export const usePaywallStore = create<PaywallState>((set) => ({
  open: false,
  capability: undefined,
  info: undefined,
  openPaywall: (payload) =>
    set({
      open: true,
      capability: payload?.capability,
      info: payload?.info,
    }),
  closePaywall: () => set({ open: false, capability: undefined, info: undefined }),
}));

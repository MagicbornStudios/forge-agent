import type { CapabilityId } from './capabilities';

export type EntitlementStatus = 'allowed' | 'locked' | 'hidden';

export interface EntitlementInfo {
  capability: CapabilityId;
  status: EntitlementStatus;
  reason?: string;
  requiredPlan?: string;
}

export interface EntitlementsContextValue {
  has: (capability: CapabilityId) => boolean;
  get: (capability: CapabilityId) => EntitlementInfo;
  openPaywall?: (capability: CapabilityId, info: EntitlementInfo) => void;
}

import { create } from 'zustand';
import { CAPABILITIES, type CapabilityId } from '@forge/shared/entitlements/capabilities';
import type { EntitlementStatus } from '@forge/shared/entitlements/types';

export type PlanId = 'free' | 'pro';

const PLAN_CAPABILITIES: Record<PlanId, CapabilityId[]> = {
  free: [
    CAPABILITIES.STUDIO_AI_CHAT,
    CAPABILITIES.STUDIO_AI_TOOLS,
    CAPABILITIES.FORGE_AI_EDIT,
  ],
  pro: [
    CAPABILITIES.STUDIO_AI_CHAT,
    CAPABILITIES.STUDIO_AI_TOOLS,
    CAPABILITIES.STUDIO_MODELS_PAID,
    CAPABILITIES.FORGE_AI_EDIT,
    CAPABILITIES.VIDEO_EXPORT,
    CAPABILITIES.IMAGE_GENERATION,
  ],
};

export interface EntitlementsState {
  plan: PlanId;
  overrides: Partial<Record<CapabilityId, EntitlementStatus>>;

  setPlan: (plan: PlanId) => void;
  setOverride: (capability: CapabilityId, status: EntitlementStatus) => void;
  clearOverride: (capability: CapabilityId) => void;

  getStatus: (capability: CapabilityId) => EntitlementStatus;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  plan: 'free',
  overrides: {},

  setPlan: (plan) => set({ plan }),
  setOverride: (capability, status) =>
    set((state) => ({
      overrides: { ...state.overrides, [capability]: status },
    })),
  clearOverride: (capability) =>
    set((state) => {
      const next = { ...state.overrides };
      delete next[capability];
      return { overrides: next };
    }),

  getStatus: (capability) => {
    const { plan, overrides } = get();
    const override = overrides[capability];
    if (override) return override;
    return PLAN_CAPABILITIES[plan]?.includes(capability) ? 'allowed' : 'locked';
  },
}));

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OrgStoreState = {
  activeOrgId: number | null;
  hydrated: boolean;
  setActiveOrgId: (organizationId: number | null) => void;
  setHydrated: (value: boolean) => void;
};

export const useOrgStore = create<OrgStoreState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      hydrated: false,
      setActiveOrgId: (organizationId) => {
        set({ activeOrgId: organizationId });
      },
      setHydrated: (value) => {
        set({ hydrated: value });
      },
    }),
    {
      name: 'platform-active-org',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

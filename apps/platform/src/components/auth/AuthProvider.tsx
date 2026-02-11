'use client';

import * as React from 'react';
import {
  fetchMe,
  fetchOrganizations,
  setActiveOrganization as setApiActiveOrganization,
  type MeResponse,
  type OrganizationMembership,
} from '@/lib/api/studio';
import { useOrgStore } from '@/stores/org-store';
import { useQueryClient } from '@tanstack/react-query';

type User = MeResponse['user'];

type AuthContextValue = {
  user: User;
  isLoading: boolean;
  memberships: OrganizationMembership[];
  activeOrganizationId: number | null;
  activeOrganization: OrganizationMembership | null;
  switchOrganization: (organizationId: number) => Promise<number>;
  refreshUser: () => Promise<User>;
  refreshOrganizations: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>(null);
  const [memberships, setMemberships] = React.useState<OrganizationMembership[]>([]);
  const [isLoading, setLoading] = React.useState(true);
  const activeOrganizationId = useOrgStore((state) => state.activeOrgId);
  const setActiveOrgId = useOrgStore((state) => state.setActiveOrgId);
  const queryClient = useQueryClient();

  const refreshOrganizations = React.useCallback(async (): Promise<void> => {
    try {
      const data = await fetchOrganizations('include');
      setMemberships(data.memberships);
      const preferred =
        data.activeOrganizationId ??
        data.activeOrganization?.organizationId ??
        data.memberships[0]?.organizationId ??
        null;
      setActiveOrgId(preferred);
    } catch {
      setMemberships([]);
      setActiveOrgId(null);
    }
  }, [setActiveOrgId]);

  const refreshUser = React.useCallback(async (): Promise<User> => {
    setLoading(true);
    try {
      const data = await fetchMe('include');
      setUser(data.user);
      if (data.user) {
        await refreshOrganizations();
      } else {
        setMemberships([]);
        setActiveOrgId(null);
      }
      return data.user;
    } catch {
      setUser(null);
      setMemberships([]);
      setActiveOrgId(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshOrganizations, setActiveOrgId]);

  React.useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const switchOrganization = React.useCallback(
    async (organizationId: number): Promise<number> => {
      const data = await setApiActiveOrganization(organizationId, 'include');
      setMemberships(data.memberships);
      setActiveOrgId(data.activeOrganizationId);
      await queryClient.invalidateQueries({ queryKey: ['platform'] });
      return data.activeOrganizationId;
    },
    [queryClient, setActiveOrgId],
  );

  const activeOrganization =
    memberships.find((entry) => entry.organizationId === activeOrganizationId) ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        memberships,
        activeOrganizationId,
        activeOrganization,
        switchOrganization,
        refreshUser,
        refreshOrganizations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

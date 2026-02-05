'use client';

import * as React from 'react';
import { fetchMe, type MeResponse } from '@/lib/api';

type User = MeResponse['user'];

const AuthContext = React.createContext<{ user: User; isLoading: boolean } | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>(null);
  const [isLoading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchMe('include')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

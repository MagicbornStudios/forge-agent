'use client';

import * as React from 'react';
import type { RepoAuthStatusResponse } from '@/lib/api/types';
import type { RepoMode } from '@/lib/api/types';

export type RepoStudioContextValue = {
  profile: string;
  mode: RepoMode;
  platformStatus: RepoAuthStatusResponse | null;
  copyText: (text: string) => void;
};

const RepoStudioContext = React.createContext<RepoStudioContextValue | null>(null);

export function RepoStudioProvider({
  value,
  children,
}: {
  value: RepoStudioContextValue;
  children: React.ReactNode;
}) {
  return (
    <RepoStudioContext.Provider value={value}>
      {children}
    </RepoStudioContext.Provider>
  );
}

export function useRepoStudioContext(): RepoStudioContextValue {
  const ctx = React.useContext(RepoStudioContext);
  if (!ctx) {
    throw new Error('useRepoStudioContext must be used within RepoStudioProvider');
  }
  return ctx;
}

export function useRepoStudioContextOptional(): RepoStudioContextValue | null {
  return React.useContext(RepoStudioContext);
}

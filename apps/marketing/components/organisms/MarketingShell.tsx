'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { MarketingHeader } from './MarketingHeader';
import { MarketingSidebar } from './MarketingSidebar';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <div className="flex flex-1">
        {user ? (
          <>
            <MarketingSidebar userEmail={user.email} />
            <main className="min-w-0 flex-1">{children}</main>
          </>
        ) : (
          <main className="min-w-0 flex-1">{children}</main>
        )}
      </div>
    </div>
  );
}

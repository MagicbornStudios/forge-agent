'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { buildLoginReturnUrl } from '@/lib/constants/routes';

export function RequireDashboardAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || user) return;
    const search = searchParams.toString();
    const returnUrl = `${pathname}${search.length > 0 ? `?${search}` : ''}`;
    router.replace(buildLoginReturnUrl(returnUrl));
  }, [isLoading, user, router, pathname, searchParams]);

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@forge/ui';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AccountApiKeysPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage API keys for programmatic access. Backend support
          coming soon.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
        <p className="text-sm text-muted-foreground">
          No API keys yet. You will be able to create and revoke keys here once
          the feature is available.
        </p>
        <Button className="mt-4" disabled>
          Create API key (coming soon)
        </Button>
      </div>
    </div>
  );
}

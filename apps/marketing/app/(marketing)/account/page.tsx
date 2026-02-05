'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@forge/ui';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStudioApiUrl } from '@/lib/api';

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Account</h1>
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 text-card-foreground">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{user.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user.email ?? '—'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="font-medium capitalize">{user.plan ?? 'free'}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link href="/billing">
          <Button variant="outline">Billing</Button>
        </Link>
        <a href={getStudioApiUrl()} target="_blank" rel="noopener noreferrer">
          <Button>Open app</Button>
        </a>
      </div>
    </div>
  );
}

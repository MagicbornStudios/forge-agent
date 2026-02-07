'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@forge/ui';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AccountSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile and preferences.
        </p>
      </div>

      <div className="space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
        <div>
          <label className="text-sm font-medium">Name</label>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.name ?? '—'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.email ?? '—'}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Profile updates are managed in the main app. Use the Open app button
          to change your name or email.
        </p>
        <Button disabled={saving} variant="outline">
          {saving ? 'Saving…' : 'Edit profile (coming soon)'}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  cloneAgain,
  getStudioApiUrl,
} from '@/lib/api/studio';
import { useLicenses } from '@/lib/data/hooks/use-dashboard-data';

export default function DashboardLicensesPage() {
  const { user, activeOrganizationId } = useAuth();
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const licensesQuery = useLicenses(activeOrganizationId, !!user);

  async function handleCloneAgain(licenseId: number) {
    setCloningId(licenseId);
    setCloneError(null);
    try {
      const { projectId } = await cloneAgain(licenseId);
      window.open(`${getStudioApiUrl()}/?projectId=${projectId}`, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setCloneError(err instanceof Error ? err.message : 'Clone again failed');
    } finally {
      setCloningId(null);
    }
  }

  if (licensesQuery.isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading licenses...</p>
      </main>
    );
  }

  if (!user) return null;
  const licenses = licensesQuery.data ?? [];
  const error =
    cloneError ??
    (licensesQuery.error instanceof Error
      ? licensesQuery.error.message
      : licensesQuery.error
        ? 'Failed to load licenses'
        : null);

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Licenses</h1>
        <p className="text-sm text-muted-foreground">
          Purchased listings you can clone again into your Studio account.
        </p>
      </header>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {licenses.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <p className="text-muted-foreground">No purchases yet.</p>
          <Button asChild className="mt-4">
            <Link href="/catalog">Browse catalog</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {licenses.map((license) => (
            <li
              key={license.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-card-foreground sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{license.listingTitle ?? `License #${license.id}`}</p>
                {license.grantedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Purchased {new Date(license.grantedAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCloneAgain(license.id)}
                disabled={cloningId === license.id}
              >
                {cloningId === license.id ? 'Cloning...' : 'Clone again'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

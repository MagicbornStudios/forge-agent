'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@forge/ui';
import { useAuth } from '@/components/providers/AuthProvider';
import { fetchLicenses, cloneAgain, getStudioApiUrl, type LicenseItem } from '@/lib/api';

export default function AccountLicensesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchLicenses()
      .then((list) => {
        if (!cancelled) setLicenses(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleCloneAgain(licenseId: number) {
    setCloningId(licenseId);
    setError(null);
    try {
      const { projectId } = await cloneAgain(licenseId);
      const studioUrl = getStudioApiUrl();
      window.open(`${studioUrl}/?projectId=${projectId}`, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clone again failed');
    } finally {
      setCloningId(null);
    }
  }

  if (authLoading) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Licenses</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Projects you’ve purchased. Use Clone again to create another copy in your account.
      </p>
      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-muted-foreground">Loading licenses…</p>
      ) : licenses.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <p className="text-muted-foreground">No purchases yet.</p>
          <Button asChild className="mt-4">
            <Link href="/catalog">Browse catalog</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {licenses.map((license) => (
            <li
              key={license.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-card-foreground sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {license.listingTitle ?? `License #${license.id}`}
                </p>
                {license.grantedAt && (
                  <p className="text-xs text-muted-foreground">
                    Purchased {new Date(license.grantedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCloneAgain(license.id)}
                disabled={cloningId === license.id}
              >
                {cloningId === license.id ? 'Cloning…' : 'Clone again'}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <a
          href={getStudioApiUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Open in Studio
        </a>
      </div>
    </div>
  );
}

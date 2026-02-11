'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProductForm, type ProductFilterValues } from '@/components/dashboard/product-form';
import { ProductListingRow } from '@/components/dashboard/product-listing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreatorListings } from '@/lib/data/hooks/use-dashboard-data';

const DEFAULT_FILTERS: ProductFilterValues = {
  query: '',
  status: 'all',
  type: 'all',
};

export default function DashboardListingsPage() {
  const { user, isLoading: authLoading, activeOrganizationId } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<ProductFilterValues>(DEFAULT_FILTERS);
  const listingsQuery = useCreatorListings(activeOrganizationId, !!user);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnUrl=/dashboard/listings');
    }
  }, [authLoading, user, router]);

  const filtered = useMemo(() => {
    const listings = listingsQuery.data ?? [];
    const query = filters.query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesQuery =
        query.length === 0 ||
        listing.title.toLowerCase().includes(query) ||
        listing.slug.toLowerCase().includes(query);
      const matchesStatus = filters.status === 'all' || listing.status === filters.status;
      const matchesType = filters.type === 'all' || listing.listingType === filters.type;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [filters.query, filters.status, filters.type, listingsQuery.data]);

  async function copyListingUrl(slug: string) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/catalog/${slug}`;
    await navigator.clipboard.writeText(url);
  }

  if (authLoading || listingsQuery.isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">Loading listings...</p>
      </main>
    );
  }

  if (!user) return null;

  const error =
    listingsQuery.error instanceof Error
      ? listingsQuery.error.message
      : listingsQuery.error
        ? 'Failed to load listings'
        : null;

  return (
    <main className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My listings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your catalog listings, status, and playable links.
        </p>
      </header>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Find listings by title, type, and publish state.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm initialValues={filters} onSubmit={setFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listings</CardTitle>
          <CardDescription>{filtered.length} listing(s) match your filters.</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Clone mode</TableHead>
                  <TableHead>Play</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((listing) => (
                  <ProductListingRow
                    key={listing.id}
                    listing={listing}
                    onCopyUrl={copyListingUrl}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

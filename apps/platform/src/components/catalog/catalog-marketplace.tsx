'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type CatalogListing } from '@/lib/api/studio';

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price / 100);
}

function listingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    project: 'Project',
    template: 'Template',
    'strategy-core': 'Strategy core',
  };
  return labels[type] ?? type;
}

type SortMode = 'popular' | 'newest' | 'price-low' | 'price-high' | 'title';

export function CatalogMarketplace({
  listings,
}: {
  listings: CatalogListing[];
}) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'project' | 'template' | 'strategy-core'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [playableOnly, setPlayableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortMode>('popular');

  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const listing of listings) {
      if (listing.category) values.add(listing.category);
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [listings]);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = listings.filter((listing) => {
      const matchesQuery =
        q.length === 0 ||
        listing.title.toLowerCase().includes(q) ||
        listing.slug.toLowerCase().includes(q) ||
        (listing.description ?? '').toLowerCase().includes(q);
      const matchesType = typeFilter === 'all' || listing.listingType === typeFilter;
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'free' ? listing.price === 0 : listing.price > 0);
      const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
      const matchesPlayable = !playableOnly || Boolean(listing.playUrl);
      return (
        matchesQuery &&
        matchesType &&
        matchesPrice &&
        matchesCategory &&
        matchesPlayable
      );
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => {
        const da = a.updatedAt ? Date.parse(a.updatedAt) : 0;
        const db = b.updatedAt ? Date.parse(b.updatedAt) : 0;
        return db - da;
      });
    }

    return result;
  }, [categoryFilter, listings, playableOnly, priceFilter, query, sortBy, typeFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Search and filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, descriptions, slugs"
              className="pl-9"
            />
          </div>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as 'all' | 'project' | 'template' | 'strategy-core')
            }
          >
            <option value="all">All types</option>
            <option value="project">Project</option>
            <option value="template">Template</option>
            <option value="strategy-core">Strategy core</option>
          </select>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={priceFilter}
            onChange={(event) => setPriceFilter(event.target.value as 'all' | 'free' | 'paid')}
          >
            <option value="all">All prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortMode)}
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="title">Title</option>
          </select>
        </CardContent>
        <CardContent className="pt-0">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={playableOnly}
              onChange={(event) => setPlayableOnly(event.target.checked)}
            />
            Playable builds only
          </label>
        </CardContent>
      </Card>

      {filteredListings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No listings match your current filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((listing) => (
            <Card key={String(listing.id)} className="flex flex-col overflow-hidden border-border/70">
              <CardHeader className="p-0">
                <div className="relative aspect-video w-full bg-muted">
                  {listing.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 p-4 pb-0">
                  {listing.category ? <Badge variant="secondary">{listing.category}</Badge> : null}
                  <Badge variant="outline">{listingTypeLabel(listing.listingType)}</Badge>
                  {listing.playUrl ? <Badge variant="outline">Playable</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 pt-2">
                <CardTitle className="line-clamp-1 text-base">{listing.title}</CardTitle>
                {listing.description ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
                ) : null}
                <p className="mt-2 font-medium">{formatPrice(listing.price, listing.currency)}</p>
                {listing.creatorName ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">by {listing.creatorName}</p>
                ) : null}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/catalog/${listing.slug}`}>View listing</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

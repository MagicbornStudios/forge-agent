import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchListings } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse creator listings: projects, templates, and strategy cores.',
};

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  if (currency === 'USD') return `$${(price / 100).toFixed(2)}`;
  return `${price} ${currency}`;
}

function listingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    project: 'Project',
    template: 'Template',
    'strategy-core': 'Strategy core',
  };
  return labels[type] ?? type;
}

export default async function CatalogPage() {
  const listings = await fetchListings();

  return (
    <div className="min-w-0 flex-1 p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Creator catalog</h1>
        <p className="mt-1 text-muted-foreground">
          Browse projects, templates, and strategy cores from the community.
        </p>
      </header>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">No listings yet. Be the first to list.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={String(listing.id)} className="flex flex-col overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-video w-full bg-muted">
                  {listing.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 p-4 pb-0">
                  {listing.category && (
                    <Badge variant="secondary">{listing.category}</Badge>
                  )}
                  <Badge variant="outline">{listingTypeLabel(listing.listingType)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-4 pt-2">
                <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                {listing.description && (
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {listing.description}
                  </p>
                )}
                <p className="mt-2 font-medium">
                  {formatPrice(listing.price, listing.currency)}
                </p>
                {listing.creatorName && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    by {listing.creatorName}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild variant="default" className="w-full">
                  <Link href={`/catalog/${listing.slug}`}>Get</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

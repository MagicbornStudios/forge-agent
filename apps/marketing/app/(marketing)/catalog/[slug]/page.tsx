import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchListingBySlug } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export default async function CatalogListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await fetchListingBySlug(slug);
  if (!listing) notFound();

  return (
    <div className="min-w-0 flex-1 p-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/catalog"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to catalog
        </Link>
        <article>
          {listing.thumbnailUrl && (
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {listing.category && (
              <Badge variant="secondary">{listing.category}</Badge>
            )}
            <Badge variant="outline">{listingTypeLabel(listing.listingType)}</Badge>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">{listing.title}</h1>
          {listing.creatorName && (
            <p className="mt-1 text-sm text-muted-foreground">by {listing.creatorName}</p>
          )}
          <p className="mt-4 font-medium">{formatPrice(listing.price, listing.currency)}</p>
          {listing.description && (
            <p className="mt-4 text-muted-foreground whitespace-pre-wrap">
              {listing.description}
            </p>
          )}
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="#">Get</Link>
            </Button>
            <span className="ml-2 text-sm text-muted-foreground">
              (Checkout coming in a later release)
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}

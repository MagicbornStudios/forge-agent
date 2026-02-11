import Link from 'next/link';
import { ExternalLink, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { getStudioApiUrl, type CreatorListing } from '@/lib/api/studio';

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price / 100);
}

export function ProductListingRow({
  listing,
  onCopyUrl,
}: {
  listing: CreatorListing;
  onCopyUrl: (slug: string) => Promise<void>;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-0.5">
          <p className="font-medium">{listing.title}</p>
          <p className="text-xs text-muted-foreground">/{listing.slug}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{listing.listingType}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={listing.status === 'published' ? 'secondary' : 'outline'}>
          {listing.status}
        </Badge>
      </TableCell>
      <TableCell>{formatPrice(listing.price, listing.currency)}</TableCell>
      <TableCell>{listing.cloneMode}</TableCell>
      <TableCell>
        {listing.playUrl ? (
          <a href={listing.playUrl} target="_blank" rel="noreferrer" className="text-primary">
            <Play className="size-4" />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">No build</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/catalog/${listing.slug}`}>View</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onCopyUrl(listing.slug)}>
            Copy URL
          </Button>
          <Button asChild size="sm">
            <a href={getStudioApiUrl()} target="_blank" rel="noreferrer">
              Studio
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

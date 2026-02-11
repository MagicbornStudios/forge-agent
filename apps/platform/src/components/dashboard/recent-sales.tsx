import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type RecentSale = {
  licenseId: number;
  listingTitle: string;
  amountCents: number;
  platformFeeCents: number;
  grantedAt?: string | null;
};

function formatCurrencyFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function RecentSales({
  sales,
  title = 'Recent sales',
}: {
  sales: RecentSale[];
  title?: string;
}) {
  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sales yet for this organization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sales.map((sale) => {
          const purchasedAt =
            sale.grantedAt != null
              ? format(new Date(sale.grantedAt), 'MMM d, yyyy')
              : 'Unknown date';
          const netCents = sale.amountCents - sale.platformFeeCents;
          return (
            <div
              key={sale.licenseId}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{sale.listingTitle || 'Listing'}</p>
                <p className="text-xs text-muted-foreground">{purchasedAt}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatCurrencyFromCents(netCents)}</p>
                <p className="text-xs text-muted-foreground">
                  Fee {formatCurrencyFromCents(sale.platformFeeCents)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

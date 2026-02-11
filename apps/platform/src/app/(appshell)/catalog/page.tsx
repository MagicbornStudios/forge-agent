import type { Metadata } from 'next';
import { fetchListings } from '@/lib/api/studio';
import { CatalogMarketplace } from '@/components/catalog/catalog-marketplace';

export const metadata: Metadata = {
  title: 'Catalog - Forge Platform',
  description: 'Browse creator listings: projects, templates, and strategy cores.',
};

export default async function CatalogPage() {
  const listings = await fetchListings();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Listings marketplace</h1>
        <p className="mt-1 text-muted-foreground">
          Browse projects, templates, and strategy cores in a Unity-style asset catalog.
        </p>
      </header>
      <CatalogMarketplace listings={listings} />
    </div>
  );
}

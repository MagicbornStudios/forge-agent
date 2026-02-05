import Link from 'next/link';
import { fetchPromotions } from '@/lib/api';

export async function PromotionsBanner() {
  const promotions = await fetchPromotions();
  const promo = promotions[0];
  if (!promo?.title) return null;

  return (
    <div className="border-b border-border bg-muted/50 px-4 py-2 text-center text-sm text-muted-foreground">
      <span>{promo.title}</span>
      {promo.ctaUrl && (
        <>
          {' · '}
          <Link href={promo.ctaUrl} className="font-medium text-foreground underline hover:no-underline">
            Learn more
          </Link>
        </>
      )}
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@forge/ui';
import { Card, CardContent, CardHeader } from '@forge/ui';

export interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}

export function PricingCard({
  title,
  price,
  description,
  ctaLabel,
  ctaHref,
  highlighted,
}: PricingCardProps) {
  return (
    <Card className={highlighted ? 'border-primary/50' : undefined}>
      <CardHeader>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{price}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Link href={ctaHref}>
          <Button variant={highlighted ? 'default' : 'outline'} className="w-full">
            {ctaLabel}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

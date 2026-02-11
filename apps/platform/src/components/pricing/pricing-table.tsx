'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type PricingPlan = {
  id: string;
  title: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
};

export type PricingTableProps = {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  className?: string;
};

export function PricingTable({
  plans,
  title = 'Pricing',
  description,
  className,
}: PricingTableProps) {
  return (
    <section className={cn('space-y-8', className)}>
      {(title || description) && (
        <div className="space-y-2 text-center">
          {title ? <h2 className="text-2xl font-semibold">{title}</h2> : null}
          {description ? <p className="mx-auto max-w-xl text-muted-foreground">{description}</p> : null}
        </div>
      )}
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'flex h-full flex-col transition-all duration-200',
              plan.highlight ? 'border-primary/50 ring-1 ring-primary/20 shadow-lg' : null,
            )}
          >
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{plan.title}</h3>
                {plan.badge ? <Badge variant="secondary">{plan.badge}</Badge> : null}
              </div>
              <p className="text-2xl font-bold">{plan.price}</p>
              {plan.period ? <p className="text-sm text-muted-foreground">{plan.period}</p> : null}
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 pt-0">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaHref} className="mt-auto">
                <Button variant={plan.highlight ? 'default' : 'outline'} className="w-full">
                  {plan.ctaLabel}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

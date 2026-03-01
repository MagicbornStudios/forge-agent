'use client';

import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

export interface PricingPlan {
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
}

export interface PricingTableProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  className?: string;
}

export function PricingTable({
  plans,
  title = 'Pricing',
  description,
  className,
}: PricingTableProps) {
  return (
    <section className={cn('space-y-8', className)}>
      {(title || description) && (
        <div className="text-center space-y-2">
          {title && <h2 className="text-2xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-muted-foreground max-w-xl mx-auto">{description}</p>
          )}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'flex flex-col h-full transition-all duration-200',
              plan.highlight && 'border-primary/50 ring-1 ring-primary/20 shadow-[var(--shadow-lg)]'
            )}
          >
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{plan.title}</h3>
                {plan.badge && (
                  <Badge variant="secondary">{plan.badge}</Badge>
                )}
              </div>
              <p className="text-2xl font-bold">{plan.price}</p>
              {plan.period && (
                <p className="text-sm text-muted-foreground">{plan.period}</p>
              )}
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
              <Button
                asChild
                variant={plan.highlight ? 'default' : 'outline'}
                className="mt-auto w-full"
              >
                <a href={plan.ctaHref}>{plan.ctaLabel}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

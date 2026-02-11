import type { Metadata } from 'next';
import { PricingTable, type PricingPlan } from '@/components/pricing/pricing-table';

export const metadata: Metadata = {
  title: 'Pricing - Forge Platform',
  description: 'Simple pricing for customers and creators on Forge.',
};

const plans: PricingPlan[] = [
  {
    id: 'free',
    title: 'Free',
    description: 'Good for evaluating Forge and browsing catalog content.',
    price: '$0',
    period: 'No monthly fee',
    features: ['Browse docs and catalog', 'Local drafting tools', 'Community updates'],
    ctaLabel: 'Join waitlist',
    ctaHref: '/waitlist',
  },
  {
    id: 'pro',
    title: 'Pro',
    description: 'Publish listings, monetize clones, and access higher AI limits.',
    price: '$19',
    period: 'per month',
    features: ['Higher AI usage', 'Priority model access', 'Creator monetization tools'],
    ctaLabel: 'Upgrade in dashboard',
    ctaHref: '/dashboard/billing',
    highlight: true,
    badge: 'Most popular',
  },
];

export default function PricingPage() {
  return (
    <div className="py-4">
      <PricingTable
        plans={plans}
        title="Pricing"
        description="Start free and upgrade when you need stronger AI and creator features."
      />
    </div>
  );
}

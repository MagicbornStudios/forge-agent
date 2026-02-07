'use client';

import { useRouter } from 'next/navigation';
import { PricingTableOne } from '@/components/billingsdk/pricing-table-one';
import { plans } from '@/lib/billingsdk-config';
import { BlurFade } from '@/components/ui/blur-fade';

export function PricingSection() {
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise') {
      router.push('/waitlist');
    } else if (planId === 'pro') {
      router.push('/waitlist');
    } else {
      router.push('/login');
    }
  };

  return (
    <section id="pricing" className="border-b border-border">
      <div className="container px-4">
        <BlurFade delay={0.1}>
          <PricingTableOne
            plans={plans}
            title="Simple, transparent pricing"
            description="Start building for free. Upgrade when you need more AI power, collaboration, and integrations."
            theme="classic"
            onPlanSelect={handlePlanSelect}
          />
        </BlurFade>
      </div>
    </section>
  );
}

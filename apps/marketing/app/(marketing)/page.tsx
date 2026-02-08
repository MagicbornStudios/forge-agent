import type { Metadata } from 'next';
import Link from 'next/link';
import { PromotionsBanner } from '@/components/organisms/PromotionsBanner';
import { HeroBlock } from '@/components/sections/HeroBlock';
import { LogoMarquee } from '@/components/sections/LogoMarquee';
import { FeaturesBento } from '@/components/sections/FeaturesBento';
import { StatsSection } from '@/components/sections/StatsSection';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { PricingSection } from '@/components/sections/PricingSection';
import { CtaSection } from '@/components/sections/CtaSection';
import { FooterSection } from '@/components/sections/FooterSection';

export const metadata: Metadata = {
  title: 'Forge – Build Interactive Stories with AI',
  description:
    'AI-first narrative engine: visual dialogue graphs, Yarn Spinner, character relationships, and video timeline. One editor platform for branching stories and game dialogue.',
};

export default function HomePage() {
  return (
    <div className="relative">
      <PromotionsBanner />
      <HeroBlock />
      <LogoMarquee />
      <FeaturesBento />
      <StatsSection />
      <HowItWorks />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}

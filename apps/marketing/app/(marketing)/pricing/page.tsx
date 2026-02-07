import { PricingSection } from '@/components/sections/PricingSection';

export default function PricingPage() {
  return (
    <div className="min-h-[60vh]">
      <div className="container px-4 pt-16 pb-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Simple, transparent pricing. Start free and upgrade when you need
            more AI power, collaboration, and integrations.
          </p>
        </div>
      </div>
      <PricingSection />
    </div>
  );
}

import Link from 'next/link';
import { PromotionsBanner } from '@/components/organisms/PromotionsBanner';
import { HeroSection, FeatureCard, PricingCard } from '@/components/molecules';

const FEATURES = [
  {
    title: 'Unified workspace',
    description:
      'One shell, multiple workspaces. Switch between Forge (graph) and Video (timeline) without losing context.',
  },
  {
    title: 'AI in context',
    description:
      'CopilotKit-powered agents with access to selection, draft state, and domain actions.',
  },
  {
    title: 'Type-safe persistence',
    description:
      'Payload CMS and generated types. One API boundary, TanStack Query, and optional drafts.',
  },
];

export default function HomePage() {
  return (
    <div>
      <PromotionsBanner />
      <HeroSection
        title="AI-encapsulated editors for professional apps"
        description="Build workspaces and editors that feel native, with AI built in. Forge brings graph editing, timelines, and copilot-style assistance into one stack."
      />

      <section id="features" className="container border-t border-border px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} />
          ))}
        </div>
      </section>

      <section id="pricing" className="container border-t border-border px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Pricing</h2>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <PricingCard
            title="Free"
            price="$0"
            description="Get started with core features and limited AI usage."
            ctaLabel="Get started"
            ctaHref="/login"
          />
          <PricingCard
            title="Pro"
            price="Coming soon"
            description="More AI usage, export, and priority support."
            ctaLabel="Join waitlist"
            ctaHref="/waitlist"
            highlighted
          />
        </div>
      </section>

      <footer className="container border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
        <Link href="/docs" className="underline hover:text-foreground">Docs</Link>
        {' · '}
        <Link href="/waitlist" className="underline hover:text-foreground">Waitlist</Link>
        {' · '}
        <Link href="/newsletter" className="underline hover:text-foreground">Newsletter</Link>
      </footer>
    </div>
  );
}

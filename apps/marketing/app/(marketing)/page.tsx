import Link from 'next/link';
import { PricingTable } from '@forge/ui';
import { PromotionsBanner } from '@/components/organisms/PromotionsBanner';
import { HeroSection, FeatureCard } from '@/components/molecules';

const FEATURES = [
  {
    title: 'Unified editor shell',
    description:
      'One shell, multiple editors. Switch between Dialogue (graph) and Video (timeline) without losing context.',
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
  {
    title: 'Codebase Strategy (coming soon)',
    description:
      'Per-editor strategies and plans from your codebase, for any coding agent. Refine strategy with our copilot; traceable from plan to implementation.',
  },
];

export default function HomePage() {
  return (
    <div>
      <PromotionsBanner />
      <HeroSection
        title="AI-encapsulated editors for professional apps"
        description="Build editors and tools that feel native, with AI built in. Forge brings graph editing, timelines, and copilot-style assistance into one stack."
      />

      <section id="features" className="container border-t border-border px-4 py-20">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Features
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.title}
              title={f.title}
              description={f.description}
            />
          ))}
        </div>
      </section>

      <section id="pricing" className="container border-t border-border px-4 py-20">
        <PricingTable
          title="Pricing"
          description="Transparent pricing. Upgrade or downgrade anytime."
          plans={[
            {
              id: 'free',
              title: 'Free',
              description: 'Get started with core features and limited AI usage.',
              price: '$0',
              period: 'forever',
              features: [
                'Unified editor shell',
                'Core graph and timeline editors',
                'Limited AI usage',
                'Community support',
              ],
              ctaLabel: 'Get started',
              ctaHref: '/login',
            },
            {
              id: 'pro',
              title: 'Pro',
              description: 'More AI usage, export, and priority support.',
              price: 'Coming soon',
              period: '',
              features: [
                'Everything in Free',
                'Higher AI usage limits',
                'Export and advanced features',
                'Priority support',
              ],
              ctaLabel: 'Join waitlist',
              ctaHref: '/waitlist',
              highlight: true,
              badge: 'Soon',
            },
          ]}
        />
      </section>

      <footer className="container border-t border-border px-4 py-12 text-center text-sm text-muted-foreground">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/docs" className="underline transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/waitlist" className="underline transition-colors hover:text-foreground">
            Waitlist
          </Link>
          <Link href="/newsletter" className="underline transition-colors hover:text-foreground">
            Newsletter
          </Link>
        </nav>
      </footer>
    </div>
  );
}

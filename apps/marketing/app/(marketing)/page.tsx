import Link from 'next/link';
import { Button } from '@forge/ui';
import { BookOpen, Sparkles } from 'lucide-react';
import { PromotionsBanner } from '@/components/PromotionsBanner';

export default function HomePage() {
  return (
    <div>
      <PromotionsBanner />
      <section className="container flex flex-col items-center gap-8 px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          AI-encapsulated editors for professional apps
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Build workspaces and editors that feel native, with AI built in. Forge brings
          graph editing, timelines, and copilot-style assistance into one stack.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/waitlist">
            <Button size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Join waitlist
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg">
              <BookOpen className="mr-2 h-4 w-4" />
              Documentation
            </Button>
          </Link>
        </div>
      </section>

      <section id="features" className="container border-t border-border px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 font-medium">Unified workspace</h3>
            <p className="text-sm text-muted-foreground">
              One shell, multiple workspaces. Switch between Forge (graph) and Video (timeline) without losing context.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 font-medium">AI in context</h3>
            <p className="text-sm text-muted-foreground">
              CopilotKit-powered agents with access to selection, draft state, and domain actions.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 font-medium">Type-safe persistence</h3>
            <p className="text-sm text-muted-foreground">
              Payload CMS and generated types. One API boundary, TanStack Query, and optional drafts.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="container border-t border-border px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">Pricing</h2>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
            <h3 className="mb-1 font-semibold">Free</h3>
            <p className="mb-4 text-2xl font-bold">$0</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Get started with core features and limited AI usage.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">Get started</Button>
            </Link>
          </div>
          <div className="rounded-lg border border-primary/50 bg-card p-6 text-card-foreground">
            <h3 className="mb-1 font-semibold">Pro</h3>
            <p className="mb-4 text-2xl font-bold">Coming soon</p>
            <p className="mb-4 text-sm text-muted-foreground">
              More AI usage, export, and priority support.
            </p>
            <Link href="/waitlist">
              <Button className="w-full">Join waitlist</Button>
            </Link>
          </div>
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

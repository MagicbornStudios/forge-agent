import Link from 'next/link';
import { ArrowRight, BookOpen, Boxes, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveDocsAppUrl } from '@/lib/env';

export default function PlatformHomePage() {
  const docsHref = resolveDocsAppUrl();
  const quickLinks = [
    {
      title: 'Documentation',
      description: 'Architecture, guides, and API references.',
      href: docsHref,
      icon: BookOpen,
      external: true,
    },
    {
      title: 'Catalog',
      description: 'Browse projects, templates, and strategy cores.',
      href: '/catalog',
      icon: Boxes,
      external: false,
    },
    {
      title: 'Dashboard',
      description: 'Manage plan, licenses, listings, and creator preferences.',
      href: '/dashboard/overview',
      icon: CreditCard,
      external: false,
    },
  ] as const;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_50%)]" />
        <div className="relative flex flex-col gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Forge Platform
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Customer-facing hub for docs, catalog, and billing.
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              This app is powered by the Kiranism starter baseline and integrated with Studio
              APIs for auth, checkout, account, and license workflows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <a href={docsHref} target="_blank" rel="noreferrer">
                Read docs
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/catalog">Browse catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickLinks.map((item) => (
          <Card key={item.href} className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <item.icon className="size-4 text-primary" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <Button asChild variant="ghost" className="-ml-2">
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noreferrer">
                    Open
                    <ArrowRight className="size-4" />
                  </a>
                ) : (
                  <Link href={item.href}>
                    Open
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

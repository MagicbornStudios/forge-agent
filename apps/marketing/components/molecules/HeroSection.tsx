import Link from 'next/link';
import { Button } from '@forge/ui';
import { BookOpen, Sparkles } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Optional visual (e.g. HeroVideoDialog) below CTAs */
  visual?: React.ReactNode;
}

export function HeroSection({
  title,
  description,
  primaryCta = { label: 'Join waitlist', href: '/waitlist' },
  secondaryCta = { label: 'Documentation', href: '/docs' },
  visual,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="container flex flex-col items-center gap-10 px-4 py-24 text-center sm:py-28 md:py-32">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={primaryCta.href}>
            <Button size="lg" className="transition-transform hover:scale-105">
              <Sparkles className="mr-2 h-4 w-4" />
              {primaryCta.label}
            </Button>
          </Link>
          <Link href={secondaryCta.href}>
            <Button variant="outline" size="lg" className="transition-transform hover:scale-105">
              <BookOpen className="mr-2 h-4 w-4" />
              {secondaryCta.label}
            </Button>
          </Link>
        </div>
        {visual && <div className="mt-6 w-full max-w-3xl">{visual}</div>}
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Button } from '@forge/ui';
import { BookOpen, Sparkles } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function HeroSection({
  title,
  description,
  primaryCta = { label: 'Join waitlist', href: '/waitlist' },
  secondaryCta = { label: 'Documentation', href: '/docs' },
}: HeroSectionProps) {
  return (
    <section className="container flex flex-col items-center gap-8 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href={primaryCta.href}>
          <Button size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            {primaryCta.label}
          </Button>
        </Link>
        <Link href={secondaryCta.href}>
          <Button variant="outline" size="lg">
            <BookOpen className="mr-2 h-4 w-4" />
            {secondaryCta.label}
          </Button>
        </Link>
      </div>
    </section>
  );
}

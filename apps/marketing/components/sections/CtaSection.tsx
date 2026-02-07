'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { TextAnimate } from '@/components/ui/text-animate';
import { BlurFade } from '@/components/ui/blur-fade';

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-b border-border py-28">
      <BackgroundBeams className="absolute inset-0" />
      <div className="container relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <BlurFade delay={0.1}>
          <TextAnimate
            as="h2"
            animation="blurInUp"
            className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Start Building Your Story
          </TextAnimate>
        </BlurFade>

        <BlurFade delay={0.2}>
          <p className="max-w-lg text-muted-foreground">
            Join developers and narrative designers using Forge to build
            interactive stories with AI. Free to start, no credit card required.
          </p>
        </BlurFade>

        <BlurFade delay={0.3}>
          <Link href="/waitlist">
            <ShimmerButton
              className="mt-2 px-10 py-4 text-lg font-semibold"
              shimmerSize="0.12em"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </ShimmerButton>
          </Link>
        </BlurFade>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Play } from 'lucide-react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { Particles } from '@/components/ui/particles';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { TextAnimate } from '@/components/ui/text-animate';
import { BlurFade } from '@/components/ui/blur-fade';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';

const DEMO_VIDEO_SRC =
  'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
const DEMO_THUMBNAIL_SRC =
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg';

export function HeroBlock() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-border">
      {/* Background effects */}
      <AnimatedGridPattern
        className="absolute inset-0 opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        numSquares={40}
        maxOpacity={0.15}
        duration={4}
      />
      <Particles
        className="absolute inset-0"
        quantity={60}
        staticity={40}
        ease={60}
        color="#a78bfa"
      />

      <div className="container relative z-10 flex flex-col items-center gap-8 px-4 py-24 text-center sm:py-32 md:py-40">
        {/* Badge */}
        <BlurFade delay={0.1}>
          <AnimatedGradientText className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>AI-First Narrative Engine</span>
          </AnimatedGradientText>
        </BlurFade>

        {/* Headline */}
        <BlurFade delay={0.2}>
          <TextAnimate
            as="h1"
            animation="blurInUp"
            className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Build Interactive Stories with AI
          </TextAnimate>
        </BlurFade>

        {/* Subtitle */}
        <BlurFade delay={0.35}>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Forge combines visual graph editing, AI-assisted authoring, and Yarn
            Spinner dialogue scripting into one editor platform. Design branching
            narratives, generate character dialogue, and export to any game
            engine.
          </p>
        </BlurFade>

        {/* CTAs */}
        <BlurFade delay={0.5}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/waitlist">
              <ShimmerButton className="px-8 py-3 font-semibold" shimmerSize="0.1em">
                <Sparkles className="mr-2 h-4 w-4" />
                Get Started Free
              </ShimmerButton>
            </Link>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-8 py-3 font-semibold backdrop-blur transition-all hover:bg-muted hover:scale-105"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </button>
            <Link href="/docs">
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-8 py-3 font-semibold backdrop-blur transition-all hover:bg-muted hover:scale-105">
                <Play className="h-4 w-4" />
                Documentation
              </button>
            </Link>
          </div>
        </BlurFade>

        <HeroVideoDialog
          videoSrc={DEMO_VIDEO_SRC}
          thumbnailSrc={DEMO_THUMBNAIL_SRC}
          thumbnailAlt="Product demo"
          open={demoOpen}
          onOpenChange={setDemoOpen}
        />

        {/* Product preview placeholder */}
        <BlurFade delay={0.65}>
          <div className="mt-8 w-full max-w-4xl overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="rounded-full border border-border/50 bg-background/80 p-4">
                  <Play className="h-8 w-8" />
                </div>
                <span className="text-sm font-medium">Product Preview</span>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

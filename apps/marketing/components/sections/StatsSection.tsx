'use client';

import { NumberTicker } from '@/components/ui/number-ticker';
import { BlurFade } from '@/components/ui/blur-fade';

const STATS = [
  { value: 150, suffix: '+', label: 'UI Components' },
  { value: 10, suffix: '', label: 'Node Types' },
  { value: 4, suffix: '', label: 'Editor Modes' },
  { value: 25, suffix: '+', label: 'Tool-UI Components' },
];

export function StatsSection() {
  return (
    <section className="border-b border-border bg-muted/30 py-16">
      <div className="container px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <BlurFade key={stat.label} delay={0.1 + i * 0.1}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-4xl font-bold tracking-tight sm:text-5xl">
                  <NumberTicker value={stat.value} />
                  {stat.suffix}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

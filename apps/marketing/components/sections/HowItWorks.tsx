'use client';

import { PenTool, Bot, Download } from 'lucide-react';
import { BlurFade } from '@/components/ui/blur-fade';
import { TextAnimate } from '@/components/ui/text-animate';
import { MagicCard } from '@/components/ui/magic-card';

const STEPS = [
  {
    icon: PenTool,
    title: 'Design your narrative graph',
    description:
      'Use the visual Dialogue Editor to create acts, chapters, and dialogue beats. Drag and drop nodes, connect storylets, and set conditional branches.',
  },
  {
    icon: Bot,
    title: 'AI assists your dialogue',
    description:
      'The AI copilot can create characters, write dialogue, add conditions, and restructure your narrative. Review changes before committing.',
  },
  {
    icon: Download,
    title: 'Export to Yarn Spinner',
    description:
      'Compile your graphs to standard .yarn files. Import into Unity, Unreal, Godot, or any Yarn Spinner runtime.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border py-20">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <BlurFade delay={0.1}>
            <TextAnimate
              as="h2"
              animation="blurInUp"
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              How it works
            </TextAnimate>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Three steps from idea to interactive dialogue.
            </p>
          </BlurFade>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <BlurFade key={step.title} delay={0.2 + i * 0.15}>
              <MagicCard className="relative flex flex-col gap-4 p-6">
                <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

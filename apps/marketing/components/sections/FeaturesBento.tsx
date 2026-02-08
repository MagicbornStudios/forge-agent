'use client';

import {
  GitBranch,
  Bot,
  Package,
  Plug,
  MessageSquare,
  ImageIcon,
} from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { BlurFade } from '@/components/ui/blur-fade';
import { TextAnimate } from '@/components/ui/text-animate';

const FEATURES = [
  {
    Icon: GitBranch,
    name: 'Dialogue Editor',
    description:
      'Visual graph editor for branching narratives. Build storylets, character dialogue, and conditional paths — then export to Yarn Spinner.',
    className: 'col-span-1 md:col-span-2 lg:col-span-2',
    href: '/docs/editors/dialogue',
    cta: 'Learn more',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent" />
    ),
  },
  {
    Icon: Bot,
    name: 'AI Copilot',
    description:
      'CopilotKit-powered assistant with access to your graph state. Plan, patch, review, and commit dialogue changes with AI.',
    className: 'col-span-1 lg:col-span-1',
    href: '/docs/ai/copilot',
    cta: 'Learn more',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
    ),
  },
  {
    Icon: Package,
    name: 'Dev Kit',
    description:
      'Ship editors in your own apps. @forge/dev-kit bundles editor shells and AI integrations; UI atoms live in @forge/ui.',
    className: 'col-span-1 lg:col-span-1',
    href: '/docs/api-reference/dev-kit',
    cta: 'Explore API',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent" />
    ),
  },
  {
    Icon: Plug,
    name: 'MCP Apps',
    description:
      'Each editor is exposed as an MCP App. Embed editors in Claude Desktop, Cursor, or VS Code as first-class tools.',
    className: 'col-span-1 md:col-span-2 lg:col-span-1',
    href: '/docs/editors',
    cta: 'Coming soon',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
    ),
  },
  {
    Icon: MessageSquare,
    name: 'Strategy Editor',
    description:
      'assistant-ui chat interface for defining per-editor strategies. Produce plans and agent artifacts for Cursor, Codex, or Claude.',
    className: 'col-span-1 lg:col-span-1',
    href: '/docs/editors/strategy',
    cta: 'Learn more',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent" />
    ),
  },
  {
    Icon: ImageIcon,
    name: 'Multi-Modal Creation',
    description:
      'Generate images, audio, and video alongside your narrative. OpenRouter for text and vision, ElevenLabs for character voices.',
    className: 'col-span-1 lg:col-span-1',
    href: '/docs/ai',
    cta: 'Learn more',
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent" />
    ),
  },
];

export function FeaturesBento() {
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
              Everything you need to build interactive stories
            </TextAnimate>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From visual graph editing to AI-assisted writing and game engine
              export. One platform, every tool.
            </p>
          </BlurFade>
        </div>

        <BlurFade delay={0.3}>
          <BentoGrid className="grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </BlurFade>
      </div>
    </section>
  );
}

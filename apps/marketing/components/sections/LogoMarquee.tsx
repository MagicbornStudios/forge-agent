'use client';

import { Marquee } from '@/components/ui/marquee';

const TECHNOLOGIES = [
  { name: 'React', icon: '⚛️' },
  { name: 'Next.js', icon: '▲' },
  { name: 'Yarn Spinner', icon: '🧶' },
  { name: 'OpenRouter', icon: '🔀' },
  { name: 'CopilotKit', icon: '🤖' },
  { name: 'shadcn/ui', icon: '🎨' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Payload CMS', icon: '📦' },
  { name: 'React Flow', icon: '🔗' },
  { name: 'ElevenLabs', icon: '🔊' },
  { name: 'Zustand', icon: '🐻' },
  { name: 'Tailwind CSS', icon: '💨' },
];

function TechLogo({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/30 px-5 py-3 backdrop-blur transition-colors hover:border-border hover:bg-card/50">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-muted-foreground">{name}</span>
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="border-b border-border py-12">
      <div className="container px-4">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Built with the best in class
        </p>
      </div>
      <Marquee pauseOnHover className="[--duration:40s]">
        {TECHNOLOGIES.map((tech) => (
          <TechLogo key={tech.name} {...tech} />
        ))}
      </Marquee>
    </section>
  );
}

'use client';

import { useEffect } from 'react';
import { CopilotKitBypassProvider } from '@/components/providers/CopilotKitBypassProvider';
import { TooltipProvider } from '@/components/providers/TooltipProvider';
import { AppShell } from '@/components/AppShell';
import { useGraphStore } from '@/lib/store';

function HomeContent() {
  const { setGraph } = useGraphStore();

  useEffect(() => {
    const sampleGraph = {
      id: 1,
      title: 'Sample Dialogue Graph',
      flow: {
        nodes: [
          {
            id: 'node_start',
            type: 'character',
            position: { x: 250, y: 50 },
            data: {
              id: 'node_start',
              type: 'CHARACTER' as const,
              label: 'Start',
              speaker: 'Narrator',
              content: 'Welcome to the tavern. A mysterious figure approaches.',
            },
          },
        ],
        edges: [],
      },
    };

    setGraph(sampleGraph);
  }, [setGraph]);

  return <AppShell />;
}

export default function Home() {
  return (
    <TooltipProvider>
      <CopilotKitBypassProvider>
        <HomeContent />
      </CopilotKitBypassProvider>
    </TooltipProvider>
  );
}

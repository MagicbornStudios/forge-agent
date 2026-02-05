'use client';

import { useEffect, useRef } from 'react';
import { CopilotKitProvider } from '@/components/providers/CopilotKitProvider';
import { TooltipProvider } from '@/components/providers/TooltipProvider';
import { AppShell } from '@/components/AppShell';
import { useGraphStore } from '@/lib/store';
import { getLastGraphId } from '@/lib/persistence/local-storage';

function HomeContent() {
  const { setGraph, loadGraph } = useGraphStore();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const run = async () => {
      const lastId = getLastGraphId();
      if (lastId != null) {
        await loadGraph(lastId);
        return;
      }
      const listRes = await fetch('/api/graphs');
      if (!listRes.ok) return;
      const docs = await listRes.json();
      if (Array.isArray(docs) && docs.length > 0) {
        const id = docs[0].id != null ? Number(docs[0].id) : docs[0].id;
        await loadGraph(id);
        return;
      }
      const createRes = await fetch('/api/graphs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled',
          flow: { nodes: [], edges: [] },
        }),
      });
      if (createRes.ok) {
        const graph = await createRes.json();
        setGraph(graph);
      }
    };

    run();
  }, [loadGraph, setGraph]);

  return <AppShell />;
}

export default function Home() {
  return (
    <TooltipProvider>
      <CopilotKitProvider defaultOpen={true}>
        <HomeContent />
      </CopilotKitProvider>
    </TooltipProvider>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { CopilotKitProvider } from '@/components/providers/CopilotKitProvider';
import { TooltipProvider } from '@/components/providers/TooltipProvider';
import { AppShell } from '@/components/AppShell';
import { useGraphStore } from '@/lib/store';
import { getLastGraphId, setLastGraphId } from '@/lib/persistence/local-storage';
import { useGraphs, useGraph, useCreateGraph } from '@/lib/data/hooks';

function HomeContent() {
  const { setGraph } = useGraphStore();
  const [lastId, setLastId] = useState<number | null>(null);
  const initialLoadDone = useRef(false);

  const graphsQuery = useGraphs();
  const graphQuery = useGraph(lastId);
  const createGraphMutation = useCreateGraph();

  useEffect(() => {
    setLastId(getLastGraphId());
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) return;

    if (lastId != null && graphQuery.data) {
      setGraph(graphQuery.data);
      setLastGraphId(graphQuery.data.id);
      initialLoadDone.current = true;
      return;
    }

    if (lastId === null && graphsQuery.data !== undefined) {
      if (Array.isArray(graphsQuery.data) && graphsQuery.data.length > 0) {
        const first = graphsQuery.data[0];
        setGraph(first);
        setLastGraphId(first.id);
      } else {
        createGraphMutation
          .mutateAsync({ title: 'Untitled', flow: { nodes: [], edges: [] } })
          .then((g) => {
            setGraph(g);
            setLastGraphId(g.id);
          })
          .catch(() => {});
      }
      initialLoadDone.current = true;
    }
  }, [
    lastId,
    graphQuery.data,
    graphsQuery.data,
    setGraph,
    createGraphMutation,
  ]);

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

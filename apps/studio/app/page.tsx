'use client';

import { useEffect, useRef } from 'react';
import { AppShell } from '@/components/AppShell';
import { AppProviders } from '@/components/AppProviders';
import { useAppShellStore } from '@/lib/app-shell/store';
import type { ForgeGraphDoc } from '@forge/types/graph';
import { useGraphStore, GRAPH_DRAFT_KEY } from '@/lib/store';
import { useGraphs, useGraph, useCreateGraph } from '@/lib/data/hooks';

function HomeContent() {
  const lastGraphId = useAppShellStore((s) => s.lastGraphId);
  const setLastGraphId = useAppShellStore((s) => s.setLastGraphId);
  const { setGraph, restoreDraft } = useGraphStore();
  const initialLoadDone = useRef(false);
  const draftRestored = useRef(false);

  const graphsQuery = useGraphs();
  const graphQuery = useGraph(lastGraphId);
  const createGraphMutation = useCreateGraph();

  // Apply persisted graph draft only when it matches current doc (after app-shell has rehydrated).
  useEffect(() => {
    if (draftRestored.current || lastGraphId == null || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(GRAPH_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { state?: { documentId?: number; graph?: unknown; isDirty?: boolean; pendingFromPlan?: boolean } };
      const state = parsed?.state;
      if (state?.documentId === lastGraphId && state.graph) {
        restoreDraft({
          graph: state.graph as ForgeGraphDoc,
          isDirty: state.isDirty ?? true,
          pendingFromPlan: state.pendingFromPlan ?? false,
        });
        draftRestored.current = true;
        initialLoadDone.current = true; // don't overwrite with graphQuery.data
      }
    } catch {
      // ignore
    }
  }, [lastGraphId, restoreDraft]);

  useEffect(() => {
    if (initialLoadDone.current) return;

    if (lastGraphId != null && graphQuery.data) {
      setGraph(graphQuery.data as ForgeGraphDoc);
      setLastGraphId(graphQuery.data.id);
      initialLoadDone.current = true;
      return;
    }

    if (lastGraphId === null && graphsQuery.data !== undefined) {
      if (Array.isArray(graphsQuery.data) && graphsQuery.data.length > 0) {
        const first = graphsQuery.data[0];
        setGraph(first as ForgeGraphDoc);
        setLastGraphId(first.id);
      } else {
        createGraphMutation
          .mutateAsync({ title: 'Untitled', flow: { nodes: [], edges: [] } })
          .then((g) => {
            setGraph(g as ForgeGraphDoc);
            setLastGraphId(g.id);
          })
          .catch(() => {});
      }
      initialLoadDone.current = true;
    }
  }, [
    lastGraphId,
    graphQuery.data,
    graphsQuery.data,
    setGraph,
    setLastGraphId,
    createGraphMutation,
  ]);

  return <AppShell />;
}

export default function Home() {
  return (
    <AppProviders copilotDefaultOpen>
      <HomeContent />
    </AppProviders>
  );
}

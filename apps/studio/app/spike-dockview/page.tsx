'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DockviewReact } from 'dockview';
import type { DockviewReadyEvent, IDockviewPanelProps } from 'dockview';
import 'dockview/dist/styles/dockview.css';

const LAYOUT_KEY = 'dockview-spike-layout';

function DefaultPanel({ params }: IDockviewPanelProps) {
  const title = (params?.title as string) ?? 'Panel';
  return (
    <div className="h-full w-full overflow-auto p-4 bg-background text-foreground">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <p className="text-xs text-muted-foreground">Resize, drag tabs, float panels. Layout persists to localStorage.</p>
    </div>
  );
}

function buildDefaultLayout(api: DockviewReadyEvent['api']) {
  api.addPanel({
    id: 'main',
    component: 'default',
    title: 'Main',
  });
  api.addPanel({
    id: 'left',
    component: 'default',
    title: 'Library',
    position: { referencePanel: 'main', direction: 'left' },
  });
  api.addPanel({
    id: 'right',
    component: 'default',
    title: 'Inspector',
    position: { referencePanel: 'main', direction: 'right' },
  });
  api.addPanel({
    id: 'bottom',
    component: 'default',
    title: 'Workbench',
    position: { referencePanel: 'main', direction: 'below' },
  });
}

export default function SpikeDockviewPage() {
  const [api, setApi] = useState<DockviewReadyEvent['api'] | null>(null);

  const onReady = useCallback((event: DockviewReadyEvent) => {
    const dockApi = event.api;

    let success = false;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LAYOUT_KEY) : null;
      if (raw) {
        const layout = JSON.parse(raw);
        dockApi.fromJSON(layout);
        success = true;
      }
    } catch {
      // invalid layout, use default
    }
    if (!success) {
      buildDefaultLayout(dockApi);
    }

    setApi(dockApi);
  }, []);

  useEffect(() => {
    if (!api) return;
    const disposable = api.onDidLayoutChange(() => {
      try {
        const layout = api.toJSON();
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
      } catch {
        // ignore
      }
    });
    return () => disposable.dispose();
  }, [api]);

  return (
    <div className="h-screen w-full flex flex-col dockview-theme-dark bg-background">
      <header className="shrink-0 border-b border-border px-4 py-2">
        <h1 className="text-sm font-semibold">Dockview spike — resize, drag, float; layout persists (localStorage)</h1>
      </header>
      <div className="flex-1 min-h-0">
        <DockviewReact
          onReady={onReady}
          components={{
            default: DefaultPanel,
          }}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

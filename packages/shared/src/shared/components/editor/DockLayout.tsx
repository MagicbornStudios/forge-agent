'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DockviewReact } from 'dockview';
import type { DockviewReadyEvent, IDockviewPanelProps } from 'dockview';
import { cn } from '@forge/shared/lib/utils';
import { DockviewSlotTab } from './DockviewSlotTab';
import type { DockLayoutSlotIconKey } from './DockviewSlotTab';

export interface DockLayoutViewport {
  viewportId?: string;
  viewportType?: string;
  viewportScope?: string;
}

export interface DockLayoutSlotConfig {
  title?: string;
  iconKey?: DockLayoutSlotIconKey;
}

export interface DockLayoutProps {
  left?: React.ReactNode;
  main: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  /** Optional per-slot tab config (title + iconKey) for Dockview tab bar. */
  slots?: {
    left?: DockLayoutSlotConfig;
    main?: DockLayoutSlotConfig;
    right?: DockLayoutSlotConfig;
    bottom?: DockLayoutSlotConfig;
  };
  viewport?: DockLayoutViewport;
  leftDefaultSize?: number;
  leftMinSize?: number;
  rightDefaultSize?: number;
  rightMinSize?: number;
  bottomDefaultSize?: number;
  bottomMinSize?: number;
  layoutId?: string;
  className?: string;
}

const SLOT_IDS = ['left', 'main', 'right', 'bottom'] as const;
type SlotId = (typeof SLOT_IDS)[number];

const DockLayoutContentContext = React.createContext<Record<SlotId, React.ReactNode | undefined>>({
  left: undefined,
  main: undefined,
  right: undefined,
  bottom: undefined,
});

function SlotPanel(props: IDockviewPanelProps) {
  const slots = React.useContext(DockLayoutContentContext);
  const slotId = (props.params?.slotId as SlotId) ?? 'main';
  const content = slots[slotId];
  if (content == null) return null;
  return <div className="h-full w-full min-h-0 min-w-0 overflow-hidden">{content}</div>;
}

const DEFAULT_SLOT_CONFIG: Record<SlotId, { title: string; iconKey: DockLayoutSlotIconKey }> = {
  left: { title: 'Library', iconKey: 'library' },
  main: { title: 'Main', iconKey: 'main' },
  right: { title: 'Inspector', iconKey: 'inspector' },
  bottom: { title: 'Workbench', iconKey: 'workbench' },
};

function buildDefaultLayout(
  api: DockviewReadyEvent['api'],
  slots: { left?: React.ReactNode; main: React.ReactNode; right?: React.ReactNode; bottom?: React.ReactNode },
  slotConfig?: DockLayoutProps['slots']
) {
  const hasLeft = slots.left != null;
  const hasRight = slots.right != null;
  const hasBottom = slots.bottom != null;

  const mainConfig = { ...DEFAULT_SLOT_CONFIG.main, ...slotConfig?.main };
  api.addPanel({
    id: 'main',
    component: 'slot',
    tabComponent: 'slotTab',
    params: { slotId: 'main', iconKey: mainConfig.iconKey, title: mainConfig.title },
    title: mainConfig.title,
  });

  if (hasLeft) {
    const leftConfig = { ...DEFAULT_SLOT_CONFIG.left, ...slotConfig?.left };
    api.addPanel({
      id: 'left',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'left', iconKey: leftConfig.iconKey, title: leftConfig.title },
      title: leftConfig.title,
      position: { referencePanel: 'main', direction: 'left' },
    });
  }
  if (hasRight) {
    const rightConfig = { ...DEFAULT_SLOT_CONFIG.right, ...slotConfig?.right };
    api.addPanel({
      id: 'right',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'right', iconKey: rightConfig.iconKey, title: rightConfig.title },
      title: rightConfig.title,
      position: { referencePanel: 'main', direction: 'right' },
    });
  }
  if (hasBottom) {
    const bottomConfig = { ...DEFAULT_SLOT_CONFIG.bottom, ...slotConfig?.bottom };
    api.addPanel({
      id: 'bottom',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'bottom', iconKey: bottomConfig.iconKey, title: bottomConfig.title },
      title: bottomConfig.title,
      position: { referencePanel: 'main', direction: 'below' },
    });
  }
}

export function DockLayout({
  left,
  main,
  right,
  bottom,
  viewport,
  layoutId,
  className,
}: DockLayoutProps) {
  const [api, setApi] = useState<DockviewReadyEvent['api'] | null>(null);
  const slotsRef = useRef({ left, main, right, bottom });
  slotsRef.current = { left, main, right, bottom };

  const storageKey = layoutId ? `dockview-${layoutId}` : undefined;

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      const dockApi = event.api;
      const slots = slotsRef.current;

      let success = false;
      if (storageKey && typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const layout = JSON.parse(raw);
            dockApi.fromJSON(layout);
            success = true;
          }
        } catch {
          // invalid layout
        }
      }
      if (!success) {
        buildDefaultLayout(dockApi, slots);
      }

      setApi(dockApi);
    },
    [storageKey]
  );

  useEffect(() => {
    if (!api || !storageKey) return;
    const disposable = api.onDidLayoutChange(() => {
      try {
        const layout = api.toJSON();
        localStorage.setItem(storageKey, JSON.stringify(layout));
      } catch {
        // ignore
      }
    });
    return () => disposable.dispose();
  }, [api, storageKey]);

  const viewportAttrs = viewport
    ? {
        ...(viewport.viewportId
          ? { 'data-viewport-id': viewport.viewportId, 'data-editor-id': viewport.viewportId }
          : {}),
        ...(viewport.viewportType
          ? { 'data-viewport-type': viewport.viewportType, 'data-editor-type': viewport.viewportType }
          : {}),
        ...(viewport.viewportScope
          ? { 'data-viewport-scope': viewport.viewportScope, 'data-editor-scope': viewport.viewportScope }
          : {}),
      }
    : {};

  return (
    <DockLayoutContentContext.Provider value={{ left, main, right, bottom }}>
      <div
        className={cn('flex-1 min-h-0 overflow-hidden dockview-theme-dark', className)}
        {...viewportAttrs}
      >
        <DockviewReact
          onReady={onReady}
          components={{
            slot: SlotPanel,
          }}
          className="h-full w-full"
        />
      </div>
    </DockLayoutContentContext.Provider>
  );
}

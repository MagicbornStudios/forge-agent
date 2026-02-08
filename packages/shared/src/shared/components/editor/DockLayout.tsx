'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { DockviewReact } from 'dockview';
import type { DockviewReadyEvent, IDockviewPanelProps } from 'dockview';
import { cn } from '@forge/shared/lib/utils';
import { DockviewSlotTab, type DockLayoutSlotIconKey } from './DockviewSlotTab';

export type { DockLayoutSlotIconKey };

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

const DEFAULT_SIZES = {
  leftDefault: 20,
  leftMin: 10,
  rightDefault: 25,
  rightMin: 10,
  bottomDefault: 25,
  bottomMin: 10,
};

export interface DockLayoutRef {
  /** Clear persisted layout and restore default panels. Use when panels are lost or layout is broken. */
  resetLayout: () => void;
}

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

type LayoutSlots = {
  left?: React.ReactNode;
  main: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
};

type SizeOverrides = {
  left?: { initialWidth?: number; minimumWidth?: number };
  right?: { initialWidth?: number; minimumWidth?: number };
  bottom?: { initialHeight?: number; minimumHeight?: number };
};

function resolvePercent(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? (value as number) : fallback;
}

function percentToPixels(percent: number | undefined, total: number | undefined) {
  if (!Number.isFinite(percent) || !Number.isFinite(total) || !total) return undefined;
  return Math.max(0, Math.round(((percent as number) / 100) * (total as number)));
}

function buildDefaultLayout(
  api: DockviewReadyEvent['api'],
  slots: LayoutSlots,
  slotConfig?: DockLayoutProps['slots'],
  sizeOverrides?: SizeOverrides
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
      ...(sizeOverrides?.left ?? {}),
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
      ...(sizeOverrides?.right ?? {}),
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
      ...(sizeOverrides?.bottom ?? {}),
    });
  }
}

export const DockLayout = forwardRef<DockLayoutRef, DockLayoutProps>(function DockLayout(
  {
    left,
    main,
    right,
    bottom,
    slots: slotConfig,
    viewport,
    leftDefaultSize,
    leftMinSize,
    rightDefaultSize,
    rightMinSize,
    bottomDefaultSize,
    bottomMinSize,
    layoutId,
    className,
  },
  ref
) {
  const [api, setApi] = useState<DockviewReadyEvent['api'] | null>(null);
  const [layoutSeed, setLayoutSeed] = useState(0);
  const dockviewRef = useRef<HTMLDivElement | null>(null);
  const slotsRef = useRef({ left, main, right, bottom, slotConfig });
  slotsRef.current = { left, main, right, bottom, slotConfig };

  const storageKey = layoutId ? `dockview-${layoutId}` : undefined;
  const layoutKey = layoutId ?? 'dockview-default';

  const resetLayout = useCallback(() => {
    if (storageKey && typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    setApi(null);
    setLayoutSeed((value) => value + 1);
  }, [storageKey]);

  useImperativeHandle(ref, () => ({ resetLayout }), [resetLayout]);

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      const dockApi = event.api;
      const { left: l, main: m, right: r, bottom: b, slotConfig: config } = slotsRef.current;

      const bounds = dockviewRef.current?.getBoundingClientRect();
      const width = bounds?.width ?? 0;
      const height = bounds?.height ?? 0;

      const leftDefault = resolvePercent(leftDefaultSize, DEFAULT_SIZES.leftDefault);
      const leftMin = resolvePercent(leftMinSize, DEFAULT_SIZES.leftMin);
      const rightDefault = resolvePercent(rightDefaultSize, DEFAULT_SIZES.rightDefault);
      const rightMin = resolvePercent(rightMinSize, DEFAULT_SIZES.rightMin);
      const bottomDefault = resolvePercent(bottomDefaultSize, DEFAULT_SIZES.bottomDefault);
      const bottomMin = resolvePercent(bottomMinSize, DEFAULT_SIZES.bottomMin);

      const sizeOverrides: SizeOverrides = {
        left: l
          ? {
              initialWidth: percentToPixels(leftDefault, width),
              minimumWidth: percentToPixels(leftMin, width),
            }
          : undefined,
        right: r
          ? {
              initialWidth: percentToPixels(rightDefault, width),
              minimumWidth: percentToPixels(rightMin, width),
            }
          : undefined,
        bottom: b
          ? {
              initialHeight: percentToPixels(bottomDefault, height),
              minimumHeight: percentToPixels(bottomMin, height),
            }
          : undefined,
      };

      let loaded = false;
      if (storageKey && typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem(storageKey);
          if (raw) {
            const layout = JSON.parse(raw);
            dockApi.fromJSON(layout);
            loaded = true;
          }
        } catch {
          // ignore invalid layout
        }
      }

      if (!loaded) {
        buildDefaultLayout(dockApi, { left: l, main: m, right: r, bottom: b }, config, sizeOverrides);
      }

      setApi(dockApi);
    },
    [
      storageKey,
      leftDefaultSize,
      leftMinSize,
      rightDefaultSize,
      rightMinSize,
      bottomDefaultSize,
      bottomMinSize,
    ]
  );

  useEffect(() => {
    if (!api || !storageKey) return;
    const disposable = api.onDidLayoutChange(() => {
      try {
        const layout = api.toJSON();
        window.localStorage.setItem(storageKey, JSON.stringify(layout));
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
      <div className={cn('flex-1 min-h-0 overflow-hidden dockview-theme-dark', className)} {...viewportAttrs}>
        <DockviewReact
          key={`${layoutKey}-${layoutSeed}`}
          ref={dockviewRef}
          onReady={onReady}
          components={{
            slot: SlotPanel,
          }}
          tabComponents={{
            slotTab: DockviewSlotTab,
          }}
          className="h-full w-full"
        />
      </div>
    </DockLayoutContentContext.Provider>
  );
});

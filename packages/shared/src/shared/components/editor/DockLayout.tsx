'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { DockviewReact } from 'dockview';
import type { DockviewReadyEvent, IDockviewPanelProps } from 'dockview';
import { cn } from '@forge/shared/lib/utils';
import { DockviewSlotTab, type DockLayoutSlotIconKey } from './DockviewSlotTab';

/** Store for slot content so SlotPanel re-renders when content changes (Dockview may not re-render on context change). */
interface SlotContentState {
  slots: Record<string, React.ReactNode | undefined>;
  version: number;
  setSlots: (slots: Record<string, React.ReactNode | undefined>) => void;
}
const useSlotContentStore = create<SlotContentState>((set) => ({
  slots: {},
  version: 0,
  setSlots: (slots) => set({ slots, version: Date.now() }),
}));

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

/**
 * Descriptor for one panel tab in a rail. Used when a rail has multiple tabs (leftPanels, mainPanels, rightPanels, bottomPanels).
 * Each rail is a list of these; first panel is placed to the side of main, rest as sibling tabs (direction: 'within').
 */
export interface RailPanelDescriptor {
  id: string;
  title: string;
  iconKey?: DockLayoutSlotIconKey;
  content: React.ReactNode;
}

/** Panel id for the Inspector tab when using rightInspector+rightSettings. */
export const RIGHT_INSPECTOR_PANEL_ID = 'right-inspector';
/** Panel id for the Settings tab when using rightInspector+rightSettings. */
export const RIGHT_SETTINGS_PANEL_ID = 'right-settings';

export interface DockLayoutProps {
  left?: React.ReactNode;
  main?: React.ReactNode;
  right?: React.ReactNode;
  /** When both provided, two panels on the right (Inspector | Settings) as sibling tabs; `right` is ignored. */
  rightInspector?: React.ReactNode;
  rightSettings?: React.ReactNode;
  bottom?: React.ReactNode;
  /** Config-driven rails: list of panel tabs per side. When provided, takes precedence over single left/main/right/bottom (and rightInspector+rightSettings). */
  leftPanels?: RailPanelDescriptor[];
  mainPanels?: RailPanelDescriptor[];
  rightPanels?: RailPanelDescriptor[];
  bottomPanels?: RailPanelDescriptor[];
  /** When using slot children (DockLayout.Left etc.), omit props or use as fallback. Slot children override props. */
  children?: React.ReactNode;
  /** Optional per-slot tab config (title + iconKey) for Dockview tab bar. */
  slots?: {
    left?: DockLayoutSlotConfig;
    main?: DockLayoutSlotConfig;
    right?: DockLayoutSlotConfig;
    rightInspector?: DockLayoutSlotConfig;
    rightSettings?: DockLayoutSlotConfig;
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
  /** When provided with onLayoutChange and clearLayout, layout is controlled (no localStorage). */
  layoutJson?: string | null;
  onLayoutChange?: (json: string) => void;
  clearLayout?: () => void;
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

/** Slot/panel id: legacy fixed ids or any string from RailPanelDescriptor.id */
type SlotIdExtended = SlotId | typeof RIGHT_INSPECTOR_PANEL_ID | typeof RIGHT_SETTINGS_PANEL_ID | string;

const DockLayoutContentContext = React.createContext<Record<string, React.ReactNode | undefined>>({
  left: undefined,
  main: undefined,
  right: undefined,
  bottom: undefined,
  [RIGHT_INSPECTOR_PANEL_ID]: undefined,
  [RIGHT_SETTINGS_PANEL_ID]: undefined,
});

function SlotPanel(props: IDockviewPanelProps) {
  const slotId = (props.params?.slotId as SlotIdExtended) ?? 'main';
  const contextSlots = React.useContext(DockLayoutContentContext);
  const [content] = useSlotContentStore(useShallow((s) => [s.slots[slotId], s.version] as const));
  const resolved = content ?? contextSlots[slotId];
  if (resolved == null) return null;
  return <div className="h-full w-full min-h-0 min-w-0 overflow-hidden">{resolved}</div>;
}

const DEFAULT_SLOT_CONFIG: Record<SlotId, { title: string; iconKey: DockLayoutSlotIconKey }> = {
  left: { title: 'Library', iconKey: 'library' },
  main: { title: 'Main', iconKey: 'main' },
  right: { title: 'Inspector', iconKey: 'inspector' },
  bottom: { title: 'Assistant', iconKey: 'workbench' },
};

/** Slot components for declarative layout. Use with EditorDockLayout: <EditorDockLayout><EditorDockLayout.Left>…</EditorDockLayout.Left>…</EditorDockLayout>. */
function DockLayoutLeft({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
DockLayoutLeft.displayName = 'DockLayout.Left';

function DockLayoutMain({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
DockLayoutMain.displayName = 'DockLayout.Main';

function DockLayoutRight({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
DockLayoutRight.displayName = 'DockLayout.Right';

function DockLayoutBottom({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
DockLayoutBottom.displayName = 'DockLayout.Bottom';

const SLOT_COMPONENTS: Record<SlotId, React.ComponentType<{ children?: React.ReactNode }>> = {
  left: DockLayoutLeft,
  main: DockLayoutMain,
  right: DockLayoutRight,
  bottom: DockLayoutBottom,
};

function collectSlotsFromChildren(children: React.ReactNode): Partial<Record<SlotId, React.ReactNode>> {
  const collected: Partial<Record<SlotId, React.ReactNode>> = {};
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    for (const slotId of SLOT_IDS) {
      if (type === SLOT_COMPONENTS[slotId]) {
        collected[slotId] = (child as React.ReactElement<{ children?: React.ReactNode }>).props.children;
        break;
      }
    }
  });
  return collected;
}

type LayoutSlots = {
  left?: React.ReactNode;
  main?: React.ReactNode;
  right?: React.ReactNode;
  rightInspector?: React.ReactNode;
  rightSettings?: React.ReactNode;
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

const DEFAULT_RIGHT_INSPECTOR_CONFIG = { title: 'Inspector', iconKey: 'inspector' as DockLayoutSlotIconKey };
const DEFAULT_RIGHT_SETTINGS_CONFIG = { title: 'Settings', iconKey: 'settings' as DockLayoutSlotIconKey };

interface BuildLayoutOptions {
  slots: LayoutSlots;
  slotConfig?: DockLayoutProps['slots'];
  sizeOverrides?: SizeOverrides;
  leftPanels?: RailPanelDescriptor[];
  mainPanels?: RailPanelDescriptor[];
  rightPanels?: RailPanelDescriptor[];
  bottomPanels?: RailPanelDescriptor[];
}

function buildDefaultLayout(api: DockviewReadyEvent['api'], options: BuildLayoutOptions) {
  const { slots, slotConfig, sizeOverrides, leftPanels, mainPanels, rightPanels, bottomPanels } = options;
  const hasLeft = leftPanels?.length ? true : slots.left != null;
  const hasRight = rightPanels?.length ? true : slots.right != null || (slots.rightInspector != null && slots.rightSettings != null);
  const hasBottom = bottomPanels?.length ? true : slots.bottom != null;
  const hasMainPanels = mainPanels != null && mainPanels.length > 0;
  const mainRefId = hasMainPanels ? mainPanels[0].id : 'main';

  if (hasMainPanels) {
    const first = mainPanels![0];
    api.addPanel({
      id: first.id,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: first.id, iconKey: first.iconKey ?? DEFAULT_SLOT_CONFIG.main.iconKey, title: first.title },
      title: first.title,
    });
    for (let i = 1; i < mainPanels!.length; i++) {
      const p = mainPanels![i];
      api.addPanel({
        id: p.id,
        component: 'slot',
        tabComponent: 'slotTab',
        params: { slotId: p.id, iconKey: p.iconKey ?? DEFAULT_SLOT_CONFIG.main.iconKey, title: p.title },
        title: p.title,
        position: { referencePanel: mainRefId, direction: 'within' },
      });
    }
  } else {
    const mainConfig = { ...DEFAULT_SLOT_CONFIG.main, ...slotConfig?.main };
    api.addPanel({
      id: 'main',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'main', iconKey: mainConfig.iconKey, title: mainConfig.title },
      title: mainConfig.title,
    });
  }

  if (leftPanels?.length) {
    api.addPanel({
      id: leftPanels[0].id,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: leftPanels[0].id, iconKey: leftPanels[0].iconKey ?? DEFAULT_SLOT_CONFIG.left.iconKey, title: leftPanels[0].title },
      title: leftPanels[0].title,
      position: { referencePanel: mainRefId, direction: 'left' },
      ...(sizeOverrides?.left ?? {}),
    });
    for (let i = 1; i < leftPanels.length; i++) {
      const p = leftPanels[i];
      api.addPanel({
        id: p.id,
        component: 'slot',
        tabComponent: 'slotTab',
        params: { slotId: p.id, iconKey: p.iconKey ?? DEFAULT_SLOT_CONFIG.left.iconKey, title: p.title },
        title: p.title,
        position: { referencePanel: leftPanels[0].id, direction: 'within' },
      });
    }
  } else if (hasLeft) {
    const leftConfig = { ...DEFAULT_SLOT_CONFIG.left, ...slotConfig?.left };
    api.addPanel({
      id: 'left',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'left', iconKey: leftConfig.iconKey, title: leftConfig.title },
      title: leftConfig.title,
      position: { referencePanel: mainRefId, direction: 'left' },
      ...(sizeOverrides?.left ?? {}),
    });
  }

  if (rightPanels?.length) {
    api.addPanel({
      id: rightPanels[0].id,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: rightPanels[0].id, iconKey: rightPanels[0].iconKey ?? DEFAULT_SLOT_CONFIG.right.iconKey, title: rightPanels[0].title },
      title: rightPanels[0].title,
      position: { referencePanel: mainRefId, direction: 'right' },
      ...(sizeOverrides?.right ?? {}),
    });
    for (let i = 1; i < rightPanels.length; i++) {
      const p = rightPanels[i];
      api.addPanel({
        id: p.id,
        component: 'slot',
        tabComponent: 'slotTab',
        params: { slotId: p.id, iconKey: p.iconKey ?? DEFAULT_SLOT_CONFIG.right.iconKey, title: p.title },
        title: p.title,
        position: { referencePanel: rightPanels[0].id, direction: 'within' },
      });
    }
  } else if (slots.rightInspector != null && slots.rightSettings != null) {
    const inspectorConfig = { ...DEFAULT_RIGHT_INSPECTOR_CONFIG, ...slotConfig?.rightInspector };
    const settingsConfig = { ...DEFAULT_RIGHT_SETTINGS_CONFIG, ...slotConfig?.rightSettings };
    api.addPanel({
      id: RIGHT_INSPECTOR_PANEL_ID,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: RIGHT_INSPECTOR_PANEL_ID, iconKey: inspectorConfig.iconKey, title: inspectorConfig.title },
      title: inspectorConfig.title,
      position: { referencePanel: mainRefId, direction: 'right' },
      ...(sizeOverrides?.right ?? {}),
    });
    api.addPanel({
      id: RIGHT_SETTINGS_PANEL_ID,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: RIGHT_SETTINGS_PANEL_ID, iconKey: settingsConfig.iconKey, title: settingsConfig.title },
      title: settingsConfig.title,
      position: { referencePanel: RIGHT_INSPECTOR_PANEL_ID, direction: 'within' },
    });
  } else if (hasRight) {
    const rightConfig = { ...DEFAULT_SLOT_CONFIG.right, ...slotConfig?.right };
    api.addPanel({
      id: 'right',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'right', iconKey: rightConfig.iconKey, title: rightConfig.title },
      title: rightConfig.title,
      position: { referencePanel: mainRefId, direction: 'right' },
      ...(sizeOverrides?.right ?? {}),
    });
  }

  if (bottomPanels?.length) {
    api.addPanel({
      id: bottomPanels[0].id,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: bottomPanels[0].id, iconKey: bottomPanels[0].iconKey ?? DEFAULT_SLOT_CONFIG.bottom.iconKey, title: bottomPanels[0].title },
      title: bottomPanels[0].title,
      position: { referencePanel: mainRefId, direction: 'below' },
      ...(sizeOverrides?.bottom ?? {}),
    });
    for (let i = 1; i < bottomPanels.length; i++) {
      const p = bottomPanels[i];
      api.addPanel({
        id: p.id,
        component: 'slot',
        tabComponent: 'slotTab',
        params: { slotId: p.id, iconKey: p.iconKey ?? DEFAULT_SLOT_CONFIG.bottom.iconKey, title: p.title },
        title: p.title,
        position: { referencePanel: bottomPanels[0].id, direction: 'within' },
      });
    }
  } else if (hasBottom) {
    const bottomConfig = { ...DEFAULT_SLOT_CONFIG.bottom, ...slotConfig?.bottom };
    api.addPanel({
      id: 'bottom',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'bottom', iconKey: bottomConfig.iconKey, title: bottomConfig.title },
      title: bottomConfig.title,
      position: { referencePanel: mainRefId, direction: 'below' },
      ...(sizeOverrides?.bottom ?? {}),
    });
  }
}

const DockLayoutRoot = forwardRef<DockLayoutRef, DockLayoutProps>(function DockLayout(
  {
    left: leftProp,
    main: mainProp,
    right: rightProp,
    rightInspector: rightInspectorProp,
    rightSettings: rightSettingsProp,
    bottom: bottomProp,
    leftPanels: leftPanelsProp,
    mainPanels: mainPanelsProp,
    rightPanels: rightPanelsProp,
    bottomPanels: bottomPanelsProp,
    children,
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
    layoutJson,
    onLayoutChange,
    clearLayout,
  },
  ref
) {
  const isControlled =
    typeof onLayoutChange === 'function' && typeof clearLayout === 'function';

  const collected = React.useMemo(
    () => (children != null ? collectSlotsFromChildren(children) : {}),
    [children]
  );
  const left = collected.left ?? leftProp;
  const main = collected.main ?? mainProp;
  const right = collected.right ?? rightProp;
  const rightInspector = rightInspectorProp;
  const rightSettings = rightSettingsProp;
  const bottom = collected.bottom ?? bottomProp;

  const useRightSplit = rightPanelsProp == null && rightInspector != null && rightSettings != null;
  const layoutSlots: LayoutSlots = React.useMemo(
    () => ({
      left: leftPanelsProp == null ? left : undefined,
      main: mainPanelsProp == null ? main : undefined,
      right: rightPanelsProp == null && !useRightSplit ? right : undefined,
      rightInspector: rightPanelsProp == null && useRightSplit ? rightInspector : undefined,
      rightSettings: rightPanelsProp == null && useRightSplit ? rightSettings : undefined,
      bottom: bottomPanelsProp == null ? bottom : undefined,
    }),
    [leftPanelsProp, mainPanelsProp, rightPanelsProp, bottomPanelsProp, left, main, right, rightInspector, rightSettings, bottom, useRightSplit]
  );

  /** Resolved slot id -> content for context and store. From *Panels arrays or legacy left/main/right/bottom. */
  const resolvedSlots = React.useMemo((): Record<string, React.ReactNode | undefined> => {
    const out: Record<string, React.ReactNode | undefined> = {};
    if (leftPanelsProp?.length) {
      for (const p of leftPanelsProp) out[p.id] = p.content;
    } else if (left != null) out.left = left;
    if (mainPanelsProp?.length) {
      for (const p of mainPanelsProp) out[p.id] = p.content;
    } else if (main != null) out.main = main;
    if (rightPanelsProp?.length) {
      for (const p of rightPanelsProp) out[p.id] = p.content;
    } else if (useRightSplit) {
      out[RIGHT_INSPECTOR_PANEL_ID] = rightInspector;
      out[RIGHT_SETTINGS_PANEL_ID] = rightSettings;
    } else if (right != null) out.right = right;
    if (bottomPanelsProp?.length) {
      for (const p of bottomPanelsProp) out[p.id] = p.content;
    } else if (bottom != null) out.bottom = bottom;
    return out;
  }, [leftPanelsProp, mainPanelsProp, rightPanelsProp, bottomPanelsProp, left, main, right, rightInspector, rightSettings, bottom, useRightSplit]);

  const [api, setApi] = useState<DockviewReadyEvent['api'] | null>(null);
  const [layoutSeed, setLayoutSeed] = useState(0);
  const dockviewRef = useRef<HTMLDivElement | null>(null);
  const slotsRef = useRef({
    layoutSlots,
    slotConfig,
    leftPanels: leftPanelsProp,
    mainPanels: mainPanelsProp,
    rightPanels: rightPanelsProp,
    bottomPanels: bottomPanelsProp,
  });
  slotsRef.current = {
    layoutSlots,
    slotConfig,
    leftPanels: leftPanelsProp,
    mainPanels: mainPanelsProp,
    rightPanels: rightPanelsProp,
    bottomPanels: bottomPanelsProp,
  };

  const storageKey = layoutId ? `dockview-${layoutId}` : undefined;
  const layoutKey = layoutId ?? 'dockview-default';

  const resetLayout = useCallback(() => {
    if (isControlled) {
      clearLayout?.();
    } else if (storageKey && typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    setApi(null);
    setLayoutSeed((value) => value + 1);
  }, [isControlled, clearLayout, storageKey]);

  useImperativeHandle(ref, () => ({ resetLayout }), [resetLayout]);

  const onReady = useCallback(
    (event: DockviewReadyEvent) => {
      const dockApi = event.api;
      const { layoutSlots: slots, slotConfig: config, leftPanels, mainPanels, rightPanels, bottomPanels } = slotsRef.current;

      const bounds = dockviewRef.current?.getBoundingClientRect();
      const width = bounds?.width ?? 0;
      const height = bounds?.height ?? 0;

      const leftDefault = resolvePercent(leftDefaultSize, DEFAULT_SIZES.leftDefault);
      const leftMin = resolvePercent(leftMinSize, DEFAULT_SIZES.leftMin);
      const rightDefault = resolvePercent(rightDefaultSize, DEFAULT_SIZES.rightDefault);
      const rightMin = resolvePercent(rightMinSize, DEFAULT_SIZES.rightMin);
      const bottomDefault = resolvePercent(bottomDefaultSize, DEFAULT_SIZES.bottomDefault);
      const bottomMin = resolvePercent(bottomMinSize, DEFAULT_SIZES.bottomMin);

      const hasLeft = leftPanels?.length ? true : slots.left != null;
      const hasRight = rightPanels?.length ? true : slots.right != null || (slots.rightInspector != null && slots.rightSettings != null);
      const hasBottom = bottomPanels?.length ? true : slots.bottom != null;
      const sizeOverrides: SizeOverrides = {
        left: hasLeft
          ? {
              initialWidth: percentToPixels(leftDefault, width),
              minimumWidth: percentToPixels(leftMin, width),
            }
          : undefined,
        right: hasRight
          ? {
              initialWidth: percentToPixels(rightDefault, width),
              minimumWidth: percentToPixels(rightMin, width),
            }
          : undefined,
        bottom: hasBottom
          ? {
              initialHeight: percentToPixels(bottomDefault, height),
              minimumHeight: percentToPixels(bottomMin, height),
            }
          : undefined,
      };

      /** Layout is incompatible when using rails but saved layout has legacy right-inspector/right-settings ids. */
      const isLayoutIncompatible = (json: string) => {
        const usingRails = (rightPanels?.length ?? 0) > 0;
        return usingRails && (json.includes(RIGHT_INSPECTOR_PANEL_ID) || json.includes(RIGHT_SETTINGS_PANEL_ID));
      };

      let loaded = false;
      if (isControlled && layoutJson && layoutJson.trim()) {
        try {
          if (!isLayoutIncompatible(layoutJson)) {
            const layout = JSON.parse(layoutJson);
            dockApi.fromJSON(layout);
            loaded = true;
          }
        } catch {
          // ignore invalid layout
        }
      }
      if (!loaded && !isControlled && storageKey && typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem(storageKey);
          if (raw && !isLayoutIncompatible(raw)) {
            const layout = JSON.parse(raw);
            dockApi.fromJSON(layout);
            loaded = true;
          }
        } catch {
          // ignore invalid layout
        }
      }
      if (!loaded) {
        buildDefaultLayout(dockApi, { slots, slotConfig: config, sizeOverrides, leftPanels, mainPanels, rightPanels, bottomPanels });
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
    if (!api) return;
    if (isControlled && onLayoutChange) {
      const disposable = api.onDidLayoutChange(() => {
        try {
          const layout = api.toJSON();
          onLayoutChange(JSON.stringify(layout));
        } catch {
          // ignore
        }
      });
      return () => disposable.dispose();
    }
    if (storageKey) {
      const disposable = api.onDidLayoutChange(() => {
        try {
          const layout = api.toJSON();
          window.localStorage.setItem(storageKey, JSON.stringify(layout));
        } catch {
          // ignore
        }
      });
      return () => disposable.dispose();
    }
  }, [api, isControlled, onLayoutChange, storageKey]);

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

  const slotIdsKey = React.useMemo(
    () => Object.keys(resolvedSlots).sort().join('|'),
    [resolvedSlots]
  );
  const prevSlotsRef = useRef<Record<string, React.ReactNode | undefined>>({});

  useLayoutEffect(() => {
    const prev = prevSlotsRef.current;
    const keys = Object.keys(resolvedSlots);
    const same =
      keys.length === Object.keys(prev).length && keys.every((k) => prev[k] === resolvedSlots[k]);
    if (same) return;
    prevSlotsRef.current = resolvedSlots;
    useSlotContentStore.getState().setSlots(resolvedSlots);
  }, [resolvedSlots, slotIdsKey]);

  return (
    <DockLayoutContentContext.Provider value={resolvedSlots}>
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

/** Canonical editor dock layout. Use EditorDockLayout in new code. */
export const EditorDockLayout = Object.assign(DockLayoutRoot, {
  Left: DockLayoutLeft,
  Main: DockLayoutMain,
  Right: DockLayoutRight,
  Bottom: DockLayoutBottom,
});

/** @deprecated Use EditorDockLayout. Kept for backward compatibility. */
export const DockLayout = EditorDockLayout;

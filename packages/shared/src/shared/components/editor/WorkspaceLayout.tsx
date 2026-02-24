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
import { BookOpen, LayoutDashboard, ScanSearch, Wrench } from 'lucide-react';
import { DockviewSlotTab } from './DockviewSlotTab';

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

export interface WorkspaceLayoutViewport {
  viewportId?: string;
  viewportType?: string;
  viewportScope?: string;
}

export interface WorkspaceLayoutSlotConfig {
  title?: string;
  icon?: React.ReactNode;
}

/**
 * Descriptor for one panel tab in a rail.
 * Each rail is a list of these; first panel is placed to the side of main, rest as sibling tabs (direction: 'within').
 */
export interface RailPanelDescriptor {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface WorkspaceLayoutProps {
  /**
   * Declarative rail composition:
   * `<WorkspaceLayout.Left|Main|Right|Bottom><WorkspaceLayout.Panel ... /></...>`.
   */
  children?: React.ReactNode;
  /** Optional per-slot tab config (title + icon) for Dockview tab bar. */
  slots?: {
    left?: WorkspaceLayoutSlotConfig;
    main?: WorkspaceLayoutSlotConfig;
    right?: WorkspaceLayoutSlotConfig;
    bottom?: WorkspaceLayoutSlotConfig;
  };
  viewport?: WorkspaceLayoutViewport;
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
  /** Called when a panel is closed by the user (e.g. tab X). Use to sync View menu state. */
  onPanelClosed?: (slotId: string) => void;
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

export interface WorkspaceLayoutRef {
  /** Clear persisted layout and restore default panels. Use when panels are lost or layout is broken. */
  resetLayout: () => void;
}

/** Slot/panel id from slot descriptors. */
type SlotIdExtended = SlotId | string;

const WorkspaceLayoutContentContext = React.createContext<Record<string, React.ReactNode | undefined>>({
  left: undefined,
  main: undefined,
  right: undefined,
  bottom: undefined,
});

function SlotPanel(props: IDockviewPanelProps) {
  const slotId = (props.params?.slotId as SlotIdExtended) ?? 'main';
  const contextSlots = React.useContext(WorkspaceLayoutContentContext);
  const [content] = useSlotContentStore(useShallow((s) => [s.slots[slotId], s.version] as const));
  const resolved = content ?? contextSlots[slotId];
  if (resolved == null) return null;
  return (
    <div className="h-full w-full min-h-0 min-w-0 overflow-hidden" data-context-panel={slotId}>
      {resolved}
    </div>
  );
}

const DEFAULT_SLOT_ICONS = {
  left: <BookOpen className="size-[var(--icon-size)]" />,
  main: <LayoutDashboard className="size-[var(--icon-size)]" />,
  right: <ScanSearch className="size-[var(--icon-size)]" />,
  bottom: <Wrench className="size-[var(--icon-size)]" />,
};

const DEFAULT_SLOT_CONFIG: Record<SlotId, { title: string; icon: React.ReactNode }> = {
  left: { title: 'Library', icon: DEFAULT_SLOT_ICONS.left },
  main: { title: 'Main', icon: DEFAULT_SLOT_ICONS.main },
  right: { title: 'Inspector', icon: DEFAULT_SLOT_ICONS.right },
  bottom: { title: 'Assistant', icon: DEFAULT_SLOT_ICONS.bottom },
};

/** Slot components for declarative layout. Use with WorkspaceLayout: <WorkspaceLayout><WorkspaceLayout.Left>…</WorkspaceLayout.Left>…</WorkspaceLayout>. */
function WorkspaceLayoutLeft({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
WorkspaceLayoutLeft.displayName = 'WorkspaceLayout.Left';

function WorkspaceLayoutMain({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
WorkspaceLayoutMain.displayName = 'WorkspaceLayout.Main';

function WorkspaceLayoutRight({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
WorkspaceLayoutRight.displayName = 'WorkspaceLayout.Right';

function WorkspaceLayoutBottom({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
WorkspaceLayoutBottom.displayName = 'WorkspaceLayout.Bottom';

/** Panel descriptor for multi-panel rails. Renders null; used only for collection. */
export interface WorkspaceLayoutPanelProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

function WorkspaceLayoutPanel(_props: WorkspaceLayoutPanelProps) {
  return null;
}
WorkspaceLayoutPanel.displayName = 'WorkspaceLayout.Panel';

function isWorkspaceLayoutPanelChild(
  child: React.ReactNode
): child is React.ReactElement<WorkspaceLayoutPanelProps> {
  return React.isValidElement(child) && child.type === WorkspaceLayoutPanel;
}

const SLOT_COMPONENTS: Record<SlotId, React.ComponentType<{ children?: React.ReactNode }>> = {
  left: WorkspaceLayoutLeft,
  main: WorkspaceLayoutMain,
  right: WorkspaceLayoutRight,
  bottom: WorkspaceLayoutBottom,
};

/** Collected slot data: either a single ReactNode (legacy) or RailPanelDescriptor[] (multi-panel). */
type CollectedSlot = React.ReactNode | RailPanelDescriptor[];

function collectSlotsFromChildren(children: React.ReactNode): {
  slots: Partial<Record<SlotId, React.ReactNode>>;
  panelsFromSlots: Partial<Record<SlotId, RailPanelDescriptor[]>>;
} {
  const slots: Partial<Record<SlotId, React.ReactNode>> = {};
  const panelsFromSlots: Partial<Record<SlotId, RailPanelDescriptor[]>> = {};

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    for (const slotId of SLOT_IDS) {
      if (type === SLOT_COMPONENTS[slotId]) {
        const slotChildren = (child as React.ReactElement<{ children?: React.ReactNode }>).props.children;
        const panelDescriptors: RailPanelDescriptor[] = [];
        let hasPanelChildren = false;
        React.Children.forEach(slotChildren, (c) => {
          if (isWorkspaceLayoutPanelChild(c)) {
            hasPanelChildren = true;
            const { id, title, icon, children: content } = c.props;
            panelDescriptors.push({ id, title, icon, content: content ?? null });
          }
        });
        if (hasPanelChildren && panelDescriptors.length > 0) {
          panelsFromSlots[slotId] = panelDescriptors;
        } else if (slotChildren != null) {
          slots[slotId] = slotChildren;
        }
        break;
      }
    }
  });
  return { slots, panelsFromSlots };
}

type LayoutSlots = {
  left?: React.ReactNode;
  main?: React.ReactNode;
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

interface BuildLayoutOptions {
  slots: LayoutSlots;
  slotConfig?: WorkspaceLayoutProps['slots'];
  sizeOverrides?: SizeOverrides;
  leftPanels?: RailPanelDescriptor[];
  mainPanels?: RailPanelDescriptor[];
  rightPanels?: RailPanelDescriptor[];
  bottomPanels?: RailPanelDescriptor[];
}

function buildDefaultLayout(api: DockviewReadyEvent['api'], options: BuildLayoutOptions) {
  const { slots, slotConfig, sizeOverrides, leftPanels, mainPanels, rightPanels, bottomPanels } = options;
  const hasLeft = leftPanels?.length ? true : slots.left != null;
  const hasRight = rightPanels?.length ? true : slots.right != null;
  const hasBottom = bottomPanels?.length ? true : slots.bottom != null;
  const hasMainPanels = mainPanels != null && mainPanels.length > 0;
  const mainRefId = hasMainPanels ? mainPanels[0].id : 'main';

  if (hasMainPanels) {
    const first = mainPanels![0];
    api.addPanel({
      id: first.id,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: first.id, icon: first.icon ?? DEFAULT_SLOT_CONFIG.main.icon, title: first.title },
      title: first.title,
    });
    for (let i = 1; i < mainPanels!.length; i++) {
      const p = mainPanels![i];
      api.addPanel({
        id: p.id,
        component: 'slot',
        tabComponent: 'slotTab',
        params: { slotId: p.id, icon: p.icon ?? DEFAULT_SLOT_CONFIG.main.icon, title: p.title },
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
      params: { slotId: 'main', icon: mainConfig.icon, title: mainConfig.title },
      title: mainConfig.title,
    });
  }

  if (leftPanels?.length) {
    api.addPanel({
      id: leftPanels[0].id,
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: leftPanels[0].id, icon: leftPanels[0].icon ?? DEFAULT_SLOT_CONFIG.left.icon, title: leftPanels[0].title },
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
        params: { slotId: p.id, icon: p.icon ?? DEFAULT_SLOT_CONFIG.left.icon, title: p.title },
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
      params: { slotId: 'left', icon: leftConfig.icon, title: leftConfig.title },
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
      params: { slotId: rightPanels[0].id, icon: rightPanels[0].icon ?? DEFAULT_SLOT_CONFIG.right.icon, title: rightPanels[0].title },
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
        params: { slotId: p.id, icon: p.icon ?? DEFAULT_SLOT_CONFIG.right.icon, title: p.title },
        title: p.title,
        position: { referencePanel: rightPanels[0].id, direction: 'within' },
      });
    }
  } else if (hasRight) {
    const rightConfig = { ...DEFAULT_SLOT_CONFIG.right, ...slotConfig?.right };
    api.addPanel({
      id: 'right',
      component: 'slot',
      tabComponent: 'slotTab',
      params: { slotId: 'right', icon: rightConfig.icon, title: rightConfig.title },
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
      params: { slotId: bottomPanels[0].id, icon: bottomPanels[0].icon ?? DEFAULT_SLOT_CONFIG.bottom.icon, title: bottomPanels[0].title },
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
        params: { slotId: p.id, icon: p.icon ?? DEFAULT_SLOT_CONFIG.bottom.icon, title: p.title },
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
      params: { slotId: 'bottom', icon: bottomConfig.icon, title: bottomConfig.title },
      title: bottomConfig.title,
      position: { referencePanel: mainRefId, direction: 'below' },
      ...(sizeOverrides?.bottom ?? {}),
    });
  }
}

const WorkspaceLayoutRoot = forwardRef<WorkspaceLayoutRef, WorkspaceLayoutProps>(function WorkspaceLayoutComponent(
  {
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
    onPanelClosed,
  },
  ref
) {
  const isControlled =
    typeof onLayoutChange === 'function' && typeof clearLayout === 'function';

  const collected = React.useMemo(
    () => (children != null ? collectSlotsFromChildren(children) : { slots: {}, panelsFromSlots: {} }),
    [children]
  );
  const left = collected.slots?.left;
  const main = collected.slots?.main;
  const right = collected.slots?.right;
  const bottom = collected.slots?.bottom;

  const leftPanels = collected.panelsFromSlots?.left;
  const mainPanels = collected.panelsFromSlots?.main;
  const rightPanels = collected.panelsFromSlots?.right;
  const bottomPanels = collected.panelsFromSlots?.bottom;

  const layoutSlots: LayoutSlots = React.useMemo(
    () => ({
      left: leftPanels == null ? left : undefined,
      main: mainPanels == null ? main : undefined,
      right: rightPanels == null ? right : undefined,
      bottom: bottomPanels == null ? bottom : undefined,
    }),
    [leftPanels, mainPanels, rightPanels, bottomPanels, left, main, right, bottom]
  );

  /** Resolved slot id -> content for context and store. From *Panels arrays or legacy left/main/right/bottom. */
  const resolvedSlots = React.useMemo((): Record<string, React.ReactNode | undefined> => {
    const out: Record<string, React.ReactNode | undefined> = {};
    if (leftPanels?.length) {
      for (const p of leftPanels) out[p.id] = p.content;
    } else if (left != null) out.left = left;
    if (mainPanels?.length) {
      for (const p of mainPanels) out[p.id] = p.content;
    } else if (main != null) out.main = main;
    if (rightPanels?.length) {
      for (const p of rightPanels) out[p.id] = p.content;
    } else if (right != null) out.right = right;
    if (bottomPanels?.length) {
      for (const p of bottomPanels) out[p.id] = p.content;
    } else if (bottom != null) out.bottom = bottom;
    return out;
  }, [leftPanels, mainPanels, rightPanels, bottomPanels, left, main, right, bottom]);

  const [api, setApi] = useState<DockviewReadyEvent['api'] | null>(null);
  const [layoutSeed, setLayoutSeed] = useState(0);
  const dockviewRef = useRef<HTMLDivElement | null>(null);
  const slotsRef = useRef({
    layoutSlots,
    slotConfig,
    leftPanels,
    mainPanels,
    rightPanels,
    bottomPanels,
  });
  slotsRef.current = {
    layoutSlots,
    slotConfig,
    leftPanels,
    mainPanels,
    rightPanels,
    bottomPanels,
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
      const hasRight = rightPanels?.length ? true : slots.right != null;
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

      /** Layout is incompatible when using rail descriptors but saved layout has legacy right split ids. */
      const isLayoutIncompatible = (json: string) => {
        const usingRails = (rightPanels?.length ?? 0) > 0;
        return usingRails && (json.includes('right-inspector') || json.includes('right-settings'));
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
    if (!api || !onPanelClosed) return;
    const disposable = api.onDidRemovePanel((panel) => {
      onPanelClosed(panel.id);
    });
    return () => disposable.dispose();
  }, [api, onPanelClosed]);

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

  /** Sync panel visibility: remove panels with null content, add panels with content (Option B). */
  useEffect(() => {
    if (!api) return;
    const { leftPanels, mainPanels, rightPanels, bottomPanels } = slotsRef.current;
    const configuredMainRefId = mainPanels?.length ? mainPanels[0].id : 'main';

    const getFirstExistingPanelId = () => {
      const candidates = [
        configuredMainRefId,
        ...(mainPanels ?? []).map((p) => p.id),
        ...(leftPanels ?? []).map((p) => p.id),
        ...(rightPanels ?? []).map((p) => p.id),
        ...(bottomPanels ?? []).map((p) => p.id),
      ];
      for (const id of candidates) {
        if (api.getPanel(id)) return id;
      }
      return undefined;
    };

    const addPanel = (
      desc: RailPanelDescriptor,
      position: { referencePanel: string; direction: 'left' | 'right' | 'below' | 'within' } | undefined,
      configKey: keyof typeof DEFAULT_SLOT_CONFIG
    ) => {
      const defaultConfig = DEFAULT_SLOT_CONFIG[configKey];
      const safePosition = position != null && api.getPanel(position.referencePanel) ? position : undefined;
      api.addPanel({
        id: desc.id,
        component: 'slot',
        tabComponent: 'slotTab',
        params: { slotId: desc.id, icon: desc.icon ?? defaultConfig.icon, title: desc.title },
        title: desc.title,
        ...(safePosition ? { position: safePosition } : {}),
      });
    };

    for (const slotId of Object.keys(resolvedSlots)) {
      const content = resolvedSlots[slotId];
      const panel = api.getPanel(slotId);
      if (content == null && panel) panel.api.close();
    }

    const visibleMainPanels = (mainPanels ?? []).filter((p) => resolvedSlots[p.id] != null);
    for (let i = 0; i < visibleMainPanels.length; i++) {
      const desc = visibleMainPanels[i];
      if (api.getPanel(desc.id)) continue;
      const position =
        i === 0
          ? undefined
          : ({ referencePanel: visibleMainPanels[0].id, direction: 'within' } as const);
      addPanel(desc, position, 'main');
    }

    const resolveSideAnchor = () => {
      const preferredMainId = visibleMainPanels[0]?.id;
      if (preferredMainId && api.getPanel(preferredMainId)) return preferredMainId;
      if (api.getPanel(configuredMainRefId)) return configuredMainRefId;
      return getFirstExistingPanelId();
    };

    const rails: { panels: RailPanelDescriptor[] | undefined; configKey: keyof typeof DEFAULT_SLOT_CONFIG }[] = [
      { panels: leftPanels, configKey: 'left' },
      { panels: rightPanels, configKey: 'right' },
      { panels: bottomPanels, configKey: 'bottom' },
    ];
    for (const { panels, configKey } of rails) {
      if (!panels?.length) continue;
      const visible = panels.filter((p) => resolvedSlots[p.id] != null);
      for (let i = 0; i < visible.length; i++) {
        const desc = visible[i];
        if (api.getPanel(desc.id)) continue;
        const refId = i === 0 ? resolveSideAnchor() : visible[0].id;
        const direction: 'left' | 'right' | 'below' | 'within' = i === 0
          ? (configKey === 'left' ? 'left' : configKey === 'right' ? 'right' : 'below')
          : 'within';
        const position = refId ? { referencePanel: refId, direction } : undefined;
        addPanel(desc, position, configKey);
      }
    }
  }, [api, resolvedSlots]);

  return (
    <WorkspaceLayoutContentContext.Provider value={resolvedSlots}>
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
    </WorkspaceLayoutContentContext.Provider>
  );
});

/** Canonical rail layout surface. */
export const WorkspaceLayout = Object.assign(WorkspaceLayoutRoot, {
  Left: WorkspaceLayoutLeft,
  Main: WorkspaceLayoutMain,
  Right: WorkspaceLayoutRight,
  Bottom: WorkspaceLayoutBottom,
  Panel: WorkspaceLayoutPanel,
});

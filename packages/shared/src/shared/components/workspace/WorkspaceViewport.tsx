'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@forge/shared/lib/utils';

/** Descriptor for one viewport panel (tab + content). */
export interface ViewportPanelDescriptor {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface WorkspaceViewportProps {
  /** Viewport panels (tabs with content). */
  panels: ViewportPanelDescriptor[];
  /** Initial/open panel ids in order. Defaults to all panel ids. */
  openIds?: string[];
  /** Initial active panel id. Defaults to first open. */
  activeId?: string | null;
  /** Called when open tabs change (order + closed). */
  onOpenChange?: (openIds: string[]) => void;
  /** Called when active tab changes. */
  onActiveChange?: (activeId: string | null) => void;
  /** Allows closing the last tab and rendering an empty canvas state. Defaults to false. */
  allowEmpty?: boolean;
  /** Custom empty-state content when no tabs are open. */
  emptyState?: React.ReactNode;
  /** Optional close interceptor for dirty-draft confirmation. Return false to block close. */
  onBeforeCloseTab?: (panelId: string) => boolean | Promise<boolean>;
  className?: string;
}

export function resolveViewportOpenIds(ids: string[] | undefined, panelIds: string[], allowEmpty: boolean) {
  const filtered = (ids || []).filter((id) => panelIds.includes(id));
  if (filtered.length > 0) return filtered;
  if (allowEmpty) return [];
  return panelIds;
}

export function resolveViewportActiveId(candidate: string | null | undefined, openIds: string[]) {
  if (candidate && openIds.includes(candidate)) return candidate;
  return openIds[0] ?? null;
}

export interface ViewportCloseStateInput {
  panelId: string;
  openIds: string[];
  activeId: string | null;
  allowEmpty: boolean;
}

export interface ViewportCloseStateResult {
  didClose: boolean;
  openIds: string[];
  activeId: string | null;
}

export async function resolveViewportCloseState(
  input: ViewportCloseStateInput,
  onBeforeCloseTab?: (panelId: string) => boolean | Promise<boolean>,
): Promise<ViewportCloseStateResult> {
  if (onBeforeCloseTab) {
    const shouldClose = await onBeforeCloseTab(input.panelId);
    if (!shouldClose) {
      return {
        didClose: false,
        openIds: input.openIds,
        activeId: input.activeId,
      };
    }
  }

  const nextOpen = input.openIds.filter((id) => id !== input.panelId);
  if (nextOpen.length === 0 && !input.allowEmpty) {
    return {
      didClose: false,
      openIds: input.openIds,
      activeId: input.activeId,
    };
  }

  if (input.activeId !== input.panelId) {
    return {
      didClose: true,
      openIds: nextOpen,
      activeId: input.activeId,
    };
  }

  const closedIndex = input.openIds.indexOf(input.panelId);
  const nextActive = nextOpen[closedIndex] ?? nextOpen[closedIndex - 1] ?? nextOpen[0] ?? null;
  return {
    didClose: true,
    openIds: nextOpen,
    activeId: nextActive,
  };
}

/**
 * Viewport container: tab bar (scrollable, close per tab) + content area.
 * Used in Repo Studio main slot to host viewport panels (planning docs, file editors, etc).
 */
export function WorkspaceViewport({
  panels,
  openIds: controlledOpenIds,
  activeId: controlledActiveId,
  onOpenChange,
  onActiveChange,
  allowEmpty = false,
  emptyState,
  onBeforeCloseTab,
  className,
}: WorkspaceViewportProps) {
  const panelMap = React.useMemo(() => new Map(panels.map((p) => [p.id, p])), [panels]);
  const allIds = React.useMemo(() => panels.map((p) => p.id), [panels]);
  const isControlledOpen = controlledOpenIds !== undefined;
  const isControlledActive = controlledActiveId !== undefined;

  const sanitizeOpenIds = React.useCallback(
    (ids: string[] | undefined) => {
      return resolveViewportOpenIds(ids, allIds, allowEmpty);
    },
    [allIds, allowEmpty],
  );

  const resolveActiveId = React.useCallback((candidate: string | null | undefined, open: string[]) => {
    return resolveViewportActiveId(candidate, open);
  }, []);

  const [internalOpenIds, setInternalOpenIds] = React.useState<string[]>(() =>
    sanitizeOpenIds(controlledOpenIds),
  );
  const [internalActiveId, setInternalActiveId] = React.useState<string | null>(() => {
    const open = sanitizeOpenIds(controlledOpenIds);
    return resolveActiveId(controlledActiveId, open);
  });

  React.useEffect(() => {
    if (isControlledOpen) return;
    setInternalOpenIds((prev) => sanitizeOpenIds(prev));
  }, [isControlledOpen, sanitizeOpenIds]);

  const openIds = isControlledOpen ? sanitizeOpenIds(controlledOpenIds) : sanitizeOpenIds(internalOpenIds);
  const activeId = isControlledActive
    ? resolveActiveId(controlledActiveId, openIds)
    : resolveActiveId(internalActiveId, openIds);

  React.useEffect(() => {
    if (isControlledActive) return;
    const resolved = resolveActiveId(internalActiveId, openIds);
    if (resolved !== internalActiveId) {
      setInternalActiveId(resolved);
      onActiveChange?.(resolved);
    }
  }, [isControlledActive, internalActiveId, onActiveChange, openIds, resolveActiveId]);

  const setOpenIds = React.useCallback(
    (next: string[]) => {
      const resolved = sanitizeOpenIds(next);
      if (!isControlledOpen) setInternalOpenIds(resolved);
      onOpenChange?.(resolved);
    },
    [isControlledOpen, onOpenChange, sanitizeOpenIds],
  );
  const setActiveId = React.useCallback(
    (next: string | null) => {
      if (!isControlledActive) setInternalActiveId(next);
      onActiveChange?.(next);
    },
    [isControlledActive, onActiveChange],
  );

  const closePanel = React.useCallback(
    async (id: string) => {
      const result = await resolveViewportCloseState(
        {
          panelId: id,
          openIds,
          activeId,
          allowEmpty,
        },
        onBeforeCloseTab,
      );
      if (!result.didClose) return;
      setOpenIds(result.openIds);
      setActiveId(result.activeId);
    },
    [activeId, allowEmpty, onBeforeCloseTab, openIds, setActiveId, setOpenIds],
  );
  const handleCloseClick = React.useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    void closePanel(id);
  }, [closePanel]);

  const activeContent = activeId ? panelMap.get(activeId)?.content : null;
  const resolvedEmptyState = emptyState ?? (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      No content open.
    </div>
  );

  const tabBarRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const { scrollWidth, clientWidth } = el;
      if (scrollWidth <= clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)} data-context-panel="viewport">
      <div className="flex h-[var(--tab-height)] shrink-0 items-center gap-0 border-b border-border bg-muted/50">
        <div
          ref={tabBarRef}
          className="flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden"
          style={{ scrollBehavior: 'auto' }}
        >
          {openIds.map((id) => {
            const panel = panelMap.get(id);
            if (!panel) return null;
            const isActive = id === activeId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveId(id)}
                className={cn(
                  'flex h-full shrink-0 items-center gap-1.5 border-r border-border px-2 text-xs font-medium transition-colors',
                  'hover:bg-muted focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'bg-background text-foreground',
                  !isActive && 'text-muted-foreground',
                )}
              >
                {panel.icon != null ? <span className="shrink-0 [&_svg]:size-3.5">{panel.icon}</span> : null}
                <span className="truncate">{panel.title}</span>
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Close ${panel.title}`}
                  onClick={(e) => handleCloseClick(id, e)}
                  className="rounded p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="size-3" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{activeContent ?? resolvedEmptyState}</div>
    </div>
  );
}

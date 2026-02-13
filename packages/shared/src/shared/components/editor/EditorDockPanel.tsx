'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { LockedOverlay, type LockedOverlayProps } from '@forge/ui/locked-overlay';
import { ScrollArea } from '@forge/ui/scroll-area';
import { PanelTabs, type PanelTabDef } from './PanelTabs';

export interface DockPanelProps {
  /** Unique panel identifier. Used for settings scoping and persistence. */
  panelId: string;
  /** Optional panel title displayed in the header bar. */
  title?: string;
  /** Optional icon rendered before the title. */
  icon?: React.ReactNode;
  /**
   * Tab definitions. When provided, `PanelTabs` is rendered internally
   * and `children` is ignored.
   */
  tabs?: PanelTabDef[];
  /** Default tab to show when `tabs` is provided. */
  defaultTabId?: string;
  /** Controlled active tab ID. */
  activeTabId?: string;
  /** Called when the active tab changes. */
  onTabChange?: (id: string) => void;
  /** Actions rendered in the panel header (gear icon, close button, etc.). */
  headerActions?: React.ReactNode;
  /**
   * When true, the title bar (icon + title + headerActions) is not rendered.
   * Use when panel identity is shown elsewhere (e.g. outer chrome or custom tabs).
   */
  hideTitleBar?: boolean;
  /**
   * When true, wraps content in a `ScrollArea`. Default true.
   * Set to false for viewports (React Flow, canvas, etc.) that manage their own scroll.
   */
  scrollable?: boolean;
  /**
   * When true, overlays the panel with `LockedOverlay` from `@forge/ui/locked-overlay`.
   * Useful during AI patch application to prevent user edits.
   */
  locked?: boolean;
  /** Props to pass to the locked overlay when `locked=true`. */
  lockedProps?: Partial<LockedOverlayProps>;
  /** Panel content. Used when `tabs` is not provided. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * EditorDockPanel — a single region within an `EditorDockLayout`.
 *
 * Features:
 * - Optional title bar with icon + actions (set `hideTitleBar` when the panel identity is shown elsewhere)
 * - When `tabs` provided → renders `PanelTabs` internally
 * - When `locked` → shows `LockedOverlay`
 * - When `scrollable` → wraps content in `ScrollArea`
 *
 * @example
 * ```tsx
 * <DockPanel panelId="inspector" title="Inspector" icon={<Settings />} scrollable>
 *   <PropertyEditor ... />
 * </DockPanel>
 * ```
 *
 * @example
 * ```tsx
 * <DockPanel
 *   panelId="navigator"
 *   tabs={[
 *     { id: 'graphs', label: 'Graphs', icon: <BookOpen />, content: <GraphList /> },
 *     { id: 'nodes', label: 'Nodes', icon: <Boxes />, content: <NodePalette /> },
 *   ]}
 * />
 * ```
 */
/** Canonical editor dock panel. Use EditorDockPanel in new code. */
export function EditorDockPanel({
  panelId,
  title,
  icon,
  tabs,
  defaultTabId,
  activeTabId,
  onTabChange,
  headerActions,
  hideTitleBar = false,
  scrollable = true,
  locked = false,
  lockedProps,
  children,
  className,
}: DockPanelProps) {
  const hasHeader = !hideTitleBar && (title || icon || headerActions);
  const hasTabs = tabs && tabs.length > 0;

  const body = hasTabs ? (
    <PanelTabs
      tabs={tabs}
      defaultTabId={defaultTabId}
      activeTabId={activeTabId}
      onTabChange={onTabChange}
      className="flex-1 min-h-0"
    />
  ) : scrollable ? (
    <ScrollArea className="h-full">
      <div className="p-[var(--panel-padding)]">{children}</div>
    </ScrollArea>
  ) : (
    <div className="h-full w-full min-h-0 min-w-0">{children}</div>
  );

  return (
    <div
      className={cn('relative flex h-full w-full flex-col min-h-0 min-w-0 bg-background', className)}
      data-panel-id={panelId}
    >
      {/* Optional title bar */}
      {hasHeader && (
        <div className="flex min-h-[var(--tab-height)] items-center justify-between px-[var(--panel-padding)] py-[var(--control-padding-y)] border-b-2 border-[var(--context-accent)] bg-card shrink-0">
          <div className="flex items-center gap-[var(--control-gap)] text-[11px] min-w-0">
            {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
            {title && <span className="font-semibold text-foreground truncate">{title}</span>}
          </div>
          {headerActions && (
            <div className="flex items-center gap-[var(--control-gap)] shrink-0">{headerActions}</div>
          )}
        </div>
      )}

      {/* Panel body */}
      <div className="flex-1 min-h-0 min-w-0">{body}</div>

      {/* Lock overlay */}
      {locked && (
        <LockedOverlay
          title="Editor Locked"
          description="AI is applying changes…"
          {...lockedProps}
        />
      )}
    </div>
  );
}

/** @deprecated Use EditorDockPanel. Kept for backward compatibility. */
export const DockPanel = EditorDockPanel;

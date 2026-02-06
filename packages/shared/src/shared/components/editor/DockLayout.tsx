'use client';

import * as React from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@forge/ui/resizable';
import { cn } from '@forge/shared/lib/utils';

export interface DockLayoutViewport {
  /** Unique identifier for the viewport/editor (used in data-editor-id). */
  editorId: string;
  /** Type descriptor (e.g. 'react-flow', 'lexical', 'video'). */
  editorType: string;
  /** Optional scope for multi-editor modes. */
  editorScope?: string;
}

export interface DockLayoutProps {
  /** Left panel content (library, palette, navigator). Collapsible. */
  left?: React.ReactNode;
  /** Main/center content (viewport, editor). Always visible. */
  main: React.ReactNode;
  /** Right panel content (inspector, properties). Collapsible. */
  right?: React.ReactNode;
  /** Bottom panel content (logs, timeline, workbench). Collapsible. */
  bottom?: React.ReactNode;
  /** Viewport metadata — sets data-editor-* attributes on the main region. */
  viewport?: DockLayoutViewport;

  // — Sizing (percentages of the total group width/height) —

  /** Default width of the left panel as a % of horizontal group. @default 20 */
  leftDefaultSize?: number;
  /** Minimum width of the left panel as a % of horizontal group. @default 10 */
  leftMinSize?: number;
  /** Default width of the right panel as a % of horizontal group. @default 25 */
  rightDefaultSize?: number;
  /** Minimum width of the right panel as a % of horizontal group. @default 10 */
  rightMinSize?: number;
  /** Default height of the bottom panel as a % of vertical group. @default 25 */
  bottomDefaultSize?: number;
  /** Minimum height of the bottom panel as a % of vertical group. @default 10 */
  bottomMinSize?: number;

  // — Persistence —

  /**
   * Persistence key for `react-resizable-panels` autoSaveId.
   * When provided, panel sizes are saved to localStorage and restored on mount.
   */
  layoutId?: string;

  className?: string;
}

/**
 * DockLayout — a resizable panel layout built on `react-resizable-panels`.
 *
 * Replaces `WorkspaceLayoutGrid` (CSS Grid with hardcoded widths) with
 * user-resizable, collapsible, auto-persisting panels.
 *
 * ## Structure
 * ```
 * ResizablePanelGroup[horizontal]
 *   ├── ResizablePanel[left, collapsible]
 *   ├── ResizableHandle
 *   ├── ResizablePanel[center]
 *   │     └── ResizablePanelGroup[vertical]
 *   │           ├── ResizablePanel[main]
 *   │           ├── ResizableHandle           (if bottom)
 *   │           └── ResizablePanel[bottom, collapsible]
 *   ├── ResizableHandle
 *   └── ResizablePanel[right, collapsible]
 * ```
 *
 * @example
 * ```tsx
 * <DockLayout
 *   left={<PanelTabs tabs={sidebarTabs} />}
 *   main={<GraphEditor />}
 *   right={<Inspector />}
 *   bottom={<Timeline />}
 *   viewport={{ editorId: 'forge', editorType: 'react-flow' }}
 *   layoutId="forge-layout"
 * />
 * ```
 */
export function DockLayout({
  left,
  main,
  right,
  bottom,
  viewport,
  leftDefaultSize = 20,
  leftMinSize = 10,
  rightDefaultSize = 25,
  rightMinSize = 10,
  bottomDefaultSize = 25,
  bottomMinSize = 10,
  layoutId,
  className,
}: DockLayoutProps) {
  const hasLeft = left != null;
  const hasRight = right != null;
  const hasBottom = bottom != null;

  // Calculate center default size based on what side panels are present
  const centerDefaultSize = 100 - (hasLeft ? leftDefaultSize : 0) - (hasRight ? rightDefaultSize : 0);

  // Viewport metadata attributes
  const viewportAttrs = viewport
    ? {
        'data-editor-id': viewport.editorId,
        'data-editor-type': viewport.editorType,
        ...(viewport.editorScope ? { 'data-editor-scope': viewport.editorScope } : {}),
      }
    : {};

  // The main + bottom vertical group
  const centerContent = hasBottom ? (
    <ResizablePanelGroup direction="vertical" autoSaveId={layoutId ? `${layoutId}-v` : undefined}>
      <ResizablePanel defaultSize={100 - bottomDefaultSize} minSize={20}>
        <div className="h-full w-full min-h-0 min-w-0" {...viewportAttrs}>
          {main}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={bottomDefaultSize}
        minSize={bottomMinSize}
        collapsible
        className="min-h-0"
      >
        <div className="h-full w-full min-h-0 overflow-hidden border-t border-border bg-muted">
          {bottom}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ) : (
    <div className="h-full w-full min-h-0 min-w-0" {...viewportAttrs}>
      {main}
    </div>
  );

  return (
    <ResizablePanelGroup
      direction="horizontal"
      autoSaveId={layoutId ? `${layoutId}-h` : undefined}
      className={cn('flex-1 min-h-0 overflow-hidden', className)}
    >
      {/* Left panel */}
      {hasLeft && (
        <>
          <ResizablePanel
            defaultSize={leftDefaultSize}
            minSize={leftMinSize}
            collapsible
            className="min-w-0"
          >
            <div className="h-full w-full min-h-0 overflow-hidden border-r border-border bg-background">
              {left}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}

      {/* Center region (main + bottom) */}
      <ResizablePanel defaultSize={centerDefaultSize} minSize={30}>
        {centerContent}
      </ResizablePanel>

      {/* Right panel */}
      {hasRight && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={rightDefaultSize}
            minSize={rightMinSize}
            collapsible
            className="min-w-0"
          >
            <div className="h-full w-full min-h-0 overflow-hidden border-l border-border bg-background">
              {right}
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

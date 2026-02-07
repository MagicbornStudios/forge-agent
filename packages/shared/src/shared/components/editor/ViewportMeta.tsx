'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface ViewportMetaProps {
  children?: React.ReactNode;
  className?: string;
  /** Unique identifier for this viewport. */
  viewportId?: string;
  /** Type descriptor (e.g. 'react-flow', 'lexical', 'video', 'canvas'). */
  viewportType?: string;
  /** Optional scope for multi-viewport editors (e.g. 'narrative', 'storylet'). */
  viewportScope?: string;
}

/**
 * ViewportMeta - lightweight metadata wrapper for editor viewports.
 *
 * Sets `data-viewport-id`, `data-viewport-type`, and `data-viewport-scope`
 * attributes on the wrapping div. These attributes are used by the
 * copilot system, settings resolution, and AI highlight overlay to
 * identify which viewport is active.
 *
 * Legacy `data-editor-*` attributes are also set for compatibility.
 *
 * Renamed from `WorkspaceEditor` for clarity - this component provides
 * metadata, not an actual editor.
 *
 * @example
 * ```tsx
 * <ViewportMeta viewportId="forge-narrative" viewportType="react-flow" viewportScope="narrative">
 *   <ReactFlowProvider>
 *     <ReactFlow ... />
 *   </ReactFlowProvider>
 * </ViewportMeta>
 * ```
 */
export function ViewportMeta({
  children,
  className,
  viewportId,
  viewportType,
  viewportScope,
}: ViewportMetaProps) {
  return (
    <div
      className={cn('h-full w-full min-h-0 min-w-0', className)}
      {...(viewportId ? { 'data-viewport-id': viewportId } : {})}
      {...(viewportType ? { 'data-viewport-type': viewportType } : {})}
      {...(viewportScope ? { 'data-viewport-scope': viewportScope } : {})}
      {...(viewportId ? { 'data-editor-id': viewportId } : {})}
      {...(viewportType ? { 'data-editor-type': viewportType } : {})}
      {...(viewportScope ? { 'data-editor-scope': viewportScope } : {})}
    >
      {children}
    </div>
  );
}

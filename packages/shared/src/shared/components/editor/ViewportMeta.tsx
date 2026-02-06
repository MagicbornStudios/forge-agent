'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface ViewportMetaProps {
  children?: React.ReactNode;
  className?: string;
  /** Unique identifier for this editor viewport. */
  editorId: string;
  /** Type descriptor (e.g. 'react-flow', 'lexical', 'video', 'canvas'). */
  editorType: string;
  /** Optional scope for multi-editor modes (e.g. 'narrative', 'storylet'). */
  editorScope?: string;
}

/**
 * ViewportMeta — lightweight metadata wrapper for editor viewports.
 *
 * Sets `data-editor-id`, `data-editor-type`, and `data-editor-scope`
 * attributes on the wrapping div. These attributes are used by the
 * copilot system, settings resolution, and AI highlight overlay to
 * identify which editor is active.
 *
 * Renamed from `WorkspaceEditor` for clarity — this component provides
 * metadata, not an actual editor.
 *
 * @example
 * ```tsx
 * <ViewportMeta editorId="forge-narrative" editorType="react-flow" editorScope="narrative">
 *   <ReactFlowProvider>
 *     <ReactFlow ... />
 *   </ReactFlowProvider>
 * </ViewportMeta>
 * ```
 */
export function ViewportMeta({
  children,
  className,
  editorId,
  editorType,
  editorScope,
}: ViewportMetaProps) {
  return (
    <div
      className={cn('h-full w-full min-h-0 min-w-0', className)}
      data-editor-id={editorId}
      data-editor-type={editorType}
      {...(editorScope ? { 'data-editor-scope': editorScope } : {})}
    >
      {children}
    </div>
  );
}

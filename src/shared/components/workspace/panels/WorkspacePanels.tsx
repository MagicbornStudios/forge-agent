'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { WorkspaceLeftPanel } from './WorkspaceLeftPanel';
import { WorkspaceCanvas } from './WorkspaceCanvas';
import { WorkspaceEditor, type WorkspaceEditorProps } from './WorkspaceEditor';
import { WorkspaceInspector } from './WorkspaceInspector';
import { WorkspaceBottomPanel } from './WorkspaceBottomPanel';

export interface WorkspacePanelsProps {
  /** Left panel: library, navigator, list (graphs, pages, characters). */
  left?: React.ReactNode;
  /** Main editor surface (required when using panels). */
  canvas: React.ReactNode;
  /** Selection-driven properties panel. */
  inspector?: React.ReactNode;
  /** Optional bottom: timeline, logs, errors. */
  bottom?: React.ReactNode;
  /** Editor wrapper metadata for the canvas slot. */
  editor?: Omit<WorkspaceEditorProps, 'children'>;
  /** @deprecated Use left */
  sidebar?: React.ReactNode;
  /** @deprecated Use canvas */
  main?: React.ReactNode;
  /** @deprecated Use bottom */
  timeline?: React.ReactNode;
  className?: string;
}

/**
 * Layout grid for workspace surfaces. Renders only provided slots.
 * Left + canvas + inspector; optional bottom row. Consistent nomenclature.
 */
export function WorkspacePanels({
  left,
  canvas,
  inspector,
  bottom,
  editor,
  sidebar,
  main,
  timeline,
  className,
}: WorkspacePanelsProps) {
  const leftContent = left ?? sidebar;
  const canvasContent = canvas ?? main;
  const bottomContent = bottom ?? timeline;
  const hasLeft = leftContent != null;
  const hasInspector = inspector != null;
  const hasBottom = bottomContent != null;

  const gridCols =
    hasLeft && hasInspector
      ? 'grid-cols-[280px_1fr_360px]'
      : hasLeft
        ? 'grid-cols-[280px_1fr]'
        : hasInspector
          ? 'grid-cols-[1fr_360px]'
          : 'grid-cols-1';

  return (
    <div
      className={cn(
        'grid flex-1 min-h-0 overflow-hidden',
        gridCols,
        hasBottom ? 'grid-rows-[1fr_auto]' : 'grid-rows-1',
        className
      )}
    >
      {hasLeft && <WorkspaceLeftPanel>{leftContent}</WorkspaceLeftPanel>}
      <WorkspaceCanvas>
        <WorkspaceEditor {...editor}>{canvasContent}</WorkspaceEditor>
      </WorkspaceCanvas>
      {hasInspector && <WorkspaceInspector>{inspector}</WorkspaceInspector>}
      {hasBottom && (
        <div className="col-span-full min-h-0">
          <WorkspaceBottomPanel>{bottomContent}</WorkspaceBottomPanel>
        </div>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { WorkspaceLeftPanel } from '../panels/WorkspaceLeftPanel';
import { WorkspaceMain } from '../panels/WorkspaceMain';
import { WorkspaceInspector } from '../panels/WorkspaceInspector';
import { WorkspaceBottomPanel } from '../panels/WorkspaceBottomPanel';
import { WorkspaceEditor, type WorkspaceEditorProps } from '../panels/WorkspaceEditor';

export interface WorkspaceLayoutGridProps {
  left?: React.ReactNode;
  main: React.ReactNode;
  right?: React.ReactNode;
  bottom?: React.ReactNode;
  className?: string;
  /** Editor metadata wrapper for the main region. */
  editor: Omit<WorkspaceEditorProps, 'children'>;
}

export function WorkspaceLayoutGrid({
  left,
  main,
  right,
  bottom,
  className,
  editor,
}: WorkspaceLayoutGridProps) {
  const hasLeft = left != null;
  const hasRight = right != null;
  const hasBottom = bottom != null;

  const gridCols =
    hasLeft && hasRight
      ? 'grid-cols-[280px_1fr_360px]'
      : hasLeft
        ? 'grid-cols-[280px_1fr]'
        : hasRight
          ? 'grid-cols-[1fr_360px]'
          : 'grid-cols-1';

  const leftContent = React.isValidElement(left) && left.type === WorkspaceLeftPanel
    ? left
    : hasLeft
      ? <WorkspaceLeftPanel>{left}</WorkspaceLeftPanel>
      : null;

  const rightContent = React.isValidElement(right) && right.type === WorkspaceInspector
    ? right
    : hasRight
      ? <WorkspaceInspector>{right}</WorkspaceInspector>
      : null;

  const mainElement = (React.isValidElement(main) && main.type === WorkspaceMain
    ? main
    : <WorkspaceMain>{main}</WorkspaceMain>) as React.ReactElement<
    React.ComponentProps<typeof WorkspaceMain>
  >;
  const mainChildren = mainElement.props.children ?? null;
  const hasEditorChild =
    React.isValidElement(mainChildren) && mainChildren.type === WorkspaceEditor;
  const editorWrappedChildren = hasEditorChild
    ? mainChildren
    : <WorkspaceEditor {...editor}>{mainChildren}</WorkspaceEditor>;
  const mainContent = React.isValidElement(mainElement)
    ? React.cloneElement(mainElement, { children: editorWrappedChildren })
    : mainElement;

  const bottomContent = React.isValidElement(bottom) && bottom.type === WorkspaceBottomPanel
    ? bottom
    : hasBottom
      ? (
          <div className="col-span-full min-h-0">
            <WorkspaceBottomPanel>{bottom}</WorkspaceBottomPanel>
          </div>
        )
      : null;

  return (
    <div
      className={cn(
        'grid flex-1 min-h-0 overflow-hidden',
        gridCols,
        hasBottom ? 'grid-rows-[1fr_auto]' : 'grid-rows-1',
        className
      )}
    >
      {leftContent}
      {mainContent}
      {rightContent}
      {bottomContent}
    </div>
  );
}

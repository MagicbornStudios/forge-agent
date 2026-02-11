'use client';

import * as React from 'react';
import type { DockLayoutSlotIconKey } from './DockviewSlotTab';

export interface EditorPanelProps {
  /** Stable panel id; used for layout persistence and visibility key panel.visible.{editorId}-{id}. */
  id: string;
  /** Tab title in the rail. */
  title: string;
  /** Optional icon key for the tab. */
  iconKey?: DockLayoutSlotIconKey;
  /** Panel content (e.g. EditorDockPanel wrapping Inspector). */
  children?: React.ReactNode;
}

/**
 * Declarative panel for use inside EditorRail. Registers this panel with the layout registry;
 * content is rendered by the dock layout. Must be used within EditorLayoutProvider.
 */
export const EditorPanel = React.forwardRef<HTMLDivElement, EditorPanelProps>(function EditorPanel(
  { children },
  ref
) {
  return <div ref={ref} className="contents">{children}</div>;
});

EditorPanel.displayName = 'EditorPanel';

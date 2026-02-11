'use client';

import * as React from 'react';
import { usePanelRegistration } from './PanelRegistrationContext';
import type { RailSide } from './PanelRegistrationContext';
import { EditorPanel } from './EditorPanel';
import type { RailPanelDescriptor } from './DockLayout';
import type { DockLayoutSlotIconKey } from './DockviewSlotTab';

export interface EditorRailProps {
  /** Which rail (left, main, right, bottom). */
  side: RailSide;
  /** EditorPanel children only; each registers as a tab in this rail. */
  children?: React.ReactNode;
}

function isEditorPanelChild(child: React.ReactNode): child is React.ReactElement<EditorPanelProps> {
  return React.isValidElement(child) && child.type === EditorPanel;
}

interface EditorPanelProps {
  id: string;
  title: string;
  iconKey?: DockLayoutSlotIconKey;
  children?: React.ReactNode;
}

function extractDescriptors(children: React.ReactNode): RailPanelDescriptor[] {
  const list: RailPanelDescriptor[] = [];
  React.Children.forEach(children, (child) => {
    if (isEditorPanelChild(child)) {
      const { id, title, iconKey, children: content } = child.props;
      list.push({ id, title, iconKey, content: content ?? null });
    }
  });
  return list;
}

/**
 * Registers its EditorPanel children with the layout registry for the given side.
 * Does not render layout itself; use EditorLayout (Studio) to consume the registry.
 * Must be used within EditorLayoutProvider.
 */
export function EditorRail({ side, children }: EditorRailProps) {
  const { editorId, setRailPanels } = usePanelRegistration();
  const descriptors = React.useMemo(() => extractDescriptors(children), [children]);

  React.useEffect(() => {
    setRailPanels(side, descriptors);
    return () => setRailPanels(side, []);
  }, [editorId, side, descriptors, setRailPanels]);

  return null;
}

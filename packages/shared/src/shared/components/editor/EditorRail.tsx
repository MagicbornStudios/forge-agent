'use client';

import * as React from 'react';
import { usePanelRegistration } from './PanelRegistrationContext';
import type { RailSide } from './PanelRegistrationContext';
import { EditorPanel } from './EditorPanel';
import type { RailPanelDescriptor } from './WorkspaceLayout';
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
      list.push({ id, title, icon: iconKey, content: content ?? null });
    }
  });
  return list;
}

/**
 * @deprecated Use WorkspaceLayout.Left/Main/Right with WorkspaceLayout.Panel children instead.
 * Registers EditorPanel children with the layout registry. No-op when used with simplified
 * WorkspaceContextProvider (no setRailPanels). Must be used within WorkspaceContextProvider.
 */
export function EditorRail({ side, children }: EditorRailProps) {
  const ctx = usePanelRegistration();
  const setRailPanels = 'setRailPanels' in ctx ? (ctx as { setRailPanels: (side: RailSide, d: RailPanelDescriptor[]) => void }).setRailPanels : undefined;
  const descriptors = React.useMemo(() => extractDescriptors(children), [children]);

  React.useEffect(() => {
    if (setRailPanels) {
      setRailPanels(side, descriptors);
      return () => setRailPanels(side, []);
    }
  }, [side, descriptors, setRailPanels]);

  return null;
}

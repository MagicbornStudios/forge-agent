'use client';

import * as React from 'react';
import {
  EditorDockLayout,
  usePanelRegistration,
  type DockLayoutRef,
  type DockLayoutViewport,
  type RailPanelDescriptor,
} from '@forge/shared/components/editor';
import { useEditorPanels } from '@/lib/editor-registry/panel-registry';
import { useSettingsStore } from '@/lib/settings/store';

export interface EditorLayoutProps {
  layoutId: string;
  layoutJson?: string | null;
  onLayoutChange?: (json: string) => void;
  clearLayout?: () => void;
  viewport?: DockLayoutViewport;
  /** Optional ref for resetLayout (e.g. View menu Restore all panels). */
  ref?: React.Ref<DockLayoutRef>;
  slots?: React.ComponentProps<typeof EditorDockLayout>['slots'];
  leftDefaultSize?: number;
  rightDefaultSize?: number;
  bottomDefaultSize?: number;
  leftMinSize?: number;
  rightMinSize?: number;
  bottomMinSize?: number;
  className?: string;
}

function filterPanelsByVisibility(
  editorId: string,
  panels: RailPanelDescriptor[],
  getSettingValue: (key: string, ids?: { editorId?: string; viewportId?: string }) => unknown
): RailPanelDescriptor[] {
  return panels.filter((p) => {
    const key = `panel.visible.${editorId}-${p.id}`;
    const v = getSettingValue(key);
    return v !== false;
  });
}

/**
 * Consumes the panel registry for the current editor (from EditorLayoutProvider) and
 * renders EditorDockLayout with leftPanels/mainPanels/rightPanels/bottomPanels.
 * Filters panels by visibility (panel.visible.{editorId}-{panelId}). Must be used
 * within EditorLayoutProvider.
 */
export const EditorLayout = React.forwardRef<DockLayoutRef, EditorLayoutProps>(function EditorLayout(
  {
    layoutId,
    layoutJson,
    onLayoutChange,
    clearLayout,
    viewport,
    slots,
    leftDefaultSize,
    rightDefaultSize,
    bottomDefaultSize,
    leftMinSize,
    rightMinSize,
    bottomMinSize,
    className,
  },
  ref
) {
  const { editorId } = usePanelRegistration();
  const panelsState = useEditorPanels(editorId);
  const getSettingValue = useSettingsStore((s) => s.getSettingValue);

  const filtered = React.useMemo(
    () => ({
      left: filterPanelsByVisibility(editorId, panelsState.left, getSettingValue),
      main: filterPanelsByVisibility(editorId, panelsState.main, getSettingValue),
      right: filterPanelsByVisibility(editorId, panelsState.right, getSettingValue),
      bottom: filterPanelsByVisibility(editorId, panelsState.bottom, getSettingValue),
    }),
    [editorId, panelsState, getSettingValue]
  );

  const leftPanels = filtered.left.length > 0 ? filtered.left : undefined;
  const mainPanels = filtered.main.length > 0 ? filtered.main : undefined;
  const rightPanels = filtered.right.length > 0 ? filtered.right : undefined;
  const bottomPanels = filtered.bottom.length > 0 ? filtered.bottom : undefined;

  const hasAny =
    (leftPanels?.length ?? 0) > 0 ||
    (mainPanels?.length ?? 0) > 0 ||
    (rightPanels?.length ?? 0) > 0 ||
    (bottomPanels?.length ?? 0) > 0;

  if (!hasAny) {
    return <div className={className ?? 'flex-1 min-h-0'} data-editor-layout="empty" />;
  }

  return (
    <EditorDockLayout
      ref={ref}
      leftPanels={leftPanels}
      mainPanels={mainPanels}
      rightPanels={rightPanels}
      bottomPanels={bottomPanels}
      slots={slots}
      viewport={viewport}
      layoutId={layoutId}
      layoutJson={layoutJson}
      onLayoutChange={onLayoutChange}
      clearLayout={clearLayout}
      leftDefaultSize={leftDefaultSize}
      rightDefaultSize={rightDefaultSize}
      bottomDefaultSize={bottomDefaultSize}
      leftMinSize={leftMinSize}
      rightMinSize={rightMinSize}
      bottomMinSize={bottomMinSize}
      className={className}
    />
  );
});

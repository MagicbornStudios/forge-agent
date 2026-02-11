'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { RailPanelDescriptor } from '@forge/shared/components/editor';

export type RailSide = 'left' | 'main' | 'right' | 'bottom';

export interface EditorPanelsState {
  /** editorId -> rail side -> list of panel descriptors */
  panels: Record<string, Record<RailSide, RailPanelDescriptor[]>>;
  setRailPanels: (editorId: string, side: RailSide, descriptors: RailPanelDescriptor[]) => void;
  clearEditor: (editorId: string) => void;
  getPanels: (editorId: string) => Record<RailSide, RailPanelDescriptor[]>;
}

/** Stable empty rail so selectors never return a new reference when panels[editorId] is missing (avoids getSnapshot loop). */
const EMPTY_RAIL: Record<RailSide, RailPanelDescriptor[]> = {
  left: [],
  main: [],
  right: [],
  bottom: [],
};

function emptyRail(): Record<RailSide, RailPanelDescriptor[]> {
  return { ...EMPTY_RAIL };
}

export const usePanelRegistryStore = create<EditorPanelsState>((set, get) => ({
  panels: {},
  setRailPanels: (editorId, side, descriptors) =>
    set((state) => {
      const next = { ...state.panels };
      const editor = next[editorId] ? { ...next[editorId] } : emptyRail();
      editor[side] = descriptors;
      next[editorId] = editor;
      return { panels: next };
    }),
  clearEditor: (editorId) =>
    set((state) => {
      const next = { ...state.panels };
      delete next[editorId];
      return { panels: next };
    }),
  getPanels: (editorId) => get().panels[editorId] ?? EMPTY_RAIL,
}));

/** Subscribe to panels for one editor. Returns stable EMPTY_RAIL when editor has no panels so getSnapshot is cached. */
export function useEditorPanels(editorId: string): Record<RailSide, RailPanelDescriptor[]> {
  return usePanelRegistryStore(useShallow((s) => s.panels[editorId] ?? EMPTY_RAIL));
}

'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { ComponentType } from 'react';

/** Descriptor for an editor registered with Studio. Defaults (id, label, icon, order) live on the component. */
export interface EditorDescriptor {
  id: string;
  label: string;
  summary?: string;
  /** Icon component (e.g. MessageCircle from lucide-react) for tab and toolbar. */
  icon: ComponentType<{ className?: string; size?: number }>;
  /** The editor root component. */
  component: ComponentType;
  /** Order for tab bar; lower first. Default 0. */
  order?: number;
}

export interface EditorRegistryState {
  editors: Record<string, EditorDescriptor>;
  registerEditor: (descriptor: EditorDescriptor) => void;
  unregisterEditor: (id: string) => void;
  getEditors: () => EditorDescriptor[];
  getEditor: (id: string) => EditorDescriptor | undefined;
}

export const useEditorRegistryStore = create<EditorRegistryState>((set, get) => ({
  editors: {},
  registerEditor: (descriptor) =>
    set((state) => ({
      editors: { ...state.editors, [descriptor.id]: descriptor },
    })),
  unregisterEditor: (id) =>
    set((state) => {
      const next = { ...state.editors };
      delete next[id];
      return { editors: next };
    }),
  getEditors: () => {
    const list = Object.values(get().editors);
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  },
  getEditor: (id) => get().editors[id],
}));

/** Subscribe to the ordered list of editors. Use useShallow so selector result is stable. */
export function useEditorRegistry(): EditorDescriptor[] {
  return useEditorRegistryStore(
    useShallow((s) => {
      const list = Object.values(s.editors);
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return list;
    })
  );
}

/** Get one editor by id. */
export function useEditorDescriptor(id: string | null): EditorDescriptor | undefined {
  return useEditorRegistryStore((s) => (id ? s.editors[id] : undefined));
}

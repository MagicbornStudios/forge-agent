'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { ComponentType } from 'react';

/** Descriptor for a workspace registered with Studio. Defaults (id, label, icon, order) live on the component. */
export interface WorkspaceDescriptor {
  id: string;
  label: string;
  summary?: string;
  /** Icon component (e.g. MessageCircle from lucide-react) for tab and toolbar. */
  icon: ComponentType<{ className?: string; size?: number }>;
  /** The workspace root component. */
  component: ComponentType;
  /** Order for tab bar; lower first. Default 0. */
  order?: number;
}

export interface WorkspaceRegistryState {
  workspaces: Record<string, WorkspaceDescriptor>;
  registerWorkspace: (descriptor: WorkspaceDescriptor) => void;
  unregisterWorkspace: (id: string) => void;
  getWorkspaces: () => WorkspaceDescriptor[];
  getWorkspace: (id: string) => WorkspaceDescriptor | undefined;
}

export const useWorkspaceRegistryStore = create<WorkspaceRegistryState>((set, get) => ({
  workspaces: {},
  registerWorkspace: (descriptor) =>
    set((state) => ({
      workspaces: { ...state.workspaces, [descriptor.id]: descriptor },
    })),
  unregisterWorkspace: (id) =>
    set((state) => {
      const next = { ...state.workspaces };
      delete next[id];
      return { workspaces: next };
    }),
  getWorkspaces: () => {
    const list = Object.values(get().workspaces);
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  },
  getWorkspace: (id) => get().workspaces[id],
}));

/** Subscribe to the ordered list of workspaces. Use useShallow so selector result is stable. */
export function useWorkspaceRegistry(): WorkspaceDescriptor[] {
  return useWorkspaceRegistryStore(
    useShallow((s) => {
      const list = Object.values(s.workspaces);
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return list;
    })
  );
}

/** Get one workspace by id. */
export function useWorkspaceDescriptor(id: string | null): WorkspaceDescriptor | undefined {
  return useWorkspaceRegistryStore((s) => (id ? s.workspaces[id] : undefined));
}

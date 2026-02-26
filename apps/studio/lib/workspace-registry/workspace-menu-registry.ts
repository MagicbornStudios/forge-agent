'use client';

import React from 'react';
import { create } from 'zustand';
import type { WorkspaceMenubarMenu, WorkspaceMenubarItem } from '@forge/shared/components/workspace';

export type MenuScope = 'app' | 'workspace';

export interface MenuRegistryContext {
  workspaceId?: string;
}

export interface MenuEntry {
  scope: MenuScope;
  context: MenuRegistryContext;
  target?: string;
  menuId: string;
  label: string;
  items: WorkspaceMenubarItem[];
}

const STANDARD_MENU_ORDER = ['file', 'view', 'edit', 'state', 'settings', 'help'] as const;

function entryKey(scope: MenuScope, context: MenuRegistryContext, menuId: string): string {
  const ctx = context.workspaceId ?? '';
  return `${scope}:${ctx}:${menuId}`;
}

export interface MenuRegistryState {
  entries: Record<string, MenuEntry>;
  registerMenu: (
    scope: MenuScope,
    context: MenuRegistryContext,
    menuId: string,
    items: WorkspaceMenubarItem[],
    options?: { label?: string; target?: string }
  ) => void;
  unregisterMenu: (scope: MenuScope, context: MenuRegistryContext, menuId: string) => void;
  getMenusForTarget: (target: string | undefined, activeWorkspaceId: string | null) => WorkspaceMenubarMenu[];
}

export const useMenuRegistryStore = create<MenuRegistryState>((set, get) => ({
  entries: {},
  registerMenu: (scope, context, menuId, items, options) => {
    const key = entryKey(scope, context, menuId);
    const label = options?.label ?? (menuId === 'file' ? 'File' : menuId === 'view' ? 'View' : menuId);
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: {
          scope,
          context,
          target: options?.target,
          menuId,
          label,
          items,
        },
      },
    }));
  },
  unregisterMenu: (scope, context, menuId) => {
    const key = entryKey(scope, context, menuId);
    set((state) => {
      const next = { ...state.entries };
      delete next[key];
      return { entries: next };
    });
  },
  getMenusForTarget: (target, activeWorkspaceId) => {
    const { entries } = get();
    const byMenuId = new Map<string, { label: string; items: WorkspaceMenubarItem[] }>();
    const list = Object.values(entries);
    // Process app scope first so workspace items follow (same menuId).
    list.sort((a, b) => (a.scope === 'app' && b.scope !== 'app' ? -1 : a.scope !== 'app' && b.scope === 'app' ? 1 : 0));

    for (const entry of list) {
      if (entry.target != null && entry.target !== target) continue;
      const matchesScope =
        entry.scope === 'app' ||
        (entry.scope === 'workspace' && entry.context.workspaceId === activeWorkspaceId);
      if (!matchesScope) continue;

      const existing = byMenuId.get(entry.menuId);
      const items = existing ? [...existing.items, ...entry.items] : [...entry.items];
      byMenuId.set(entry.menuId, { label: entry.label, items });
    }

    const result: WorkspaceMenubarMenu[] = [];
    for (const menuId of STANDARD_MENU_ORDER) {
      const data = byMenuId.get(menuId);
      if (data && data.items.length > 0) {
        result.push({ id: menuId, label: data.label, items: data.items });
      }
    }
    for (const [menuId, data] of byMenuId) {
      if (!STANDARD_MENU_ORDER.includes(menuId as (typeof STANDARD_MENU_ORDER)[number]) && data.items.length > 0) {
        result.push({ id: menuId, label: data.label, items: data.items });
      }
    }
    return result;
  },
}));

/** Subscribe to merged menus for a target and active workspace. Memoizes result so getSnapshot is stable. */
export function useMenuRegistry(target: string | undefined, activeWorkspaceId: string | null): WorkspaceMenubarMenu[] {
  const entries = useMenuRegistryStore((s) => s.entries);
  return React.useMemo(
    () => {
      void entries;
      return useMenuRegistryStore.getState().getMenusForTarget(target, activeWorkspaceId);
    },
    [entries, target, activeWorkspaceId]
  );
}

'use client';

import React from 'react';
import { create } from 'zustand';
import type { EditorMenubarMenu, EditorMenubarItem } from '@forge/shared/components/editor';

export type MenuScope = 'app' | 'editor';

export interface MenuRegistryContext {
  editorId?: string;
}

export interface MenuEntry {
  scope: MenuScope;
  context: MenuRegistryContext;
  target?: string;
  menuId: string;
  label: string;
  items: EditorMenubarItem[];
}

const STANDARD_MENU_ORDER = ['file', 'view', 'edit', 'state', 'settings', 'help'] as const;

function entryKey(scope: MenuScope, context: MenuRegistryContext, menuId: string): string {
  const ctx = context.editorId ?? '';
  return `${scope}:${ctx}:${menuId}`;
}

export interface MenuRegistryState {
  entries: Record<string, MenuEntry>;
  registerMenu: (
    scope: MenuScope,
    context: MenuRegistryContext,
    menuId: string,
    items: EditorMenubarItem[],
    options?: { label?: string; target?: string }
  ) => void;
  unregisterMenu: (scope: MenuScope, context: MenuRegistryContext, menuId: string) => void;
  getMenusForTarget: (target: string | undefined, activeEditorId: string | null) => EditorMenubarMenu[];
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
  getMenusForTarget: (target, activeEditorId) => {
    const { entries } = get();
    const byMenuId = new Map<string, { label: string; items: EditorMenubarItem[] }>();
    const list = Object.values(entries);
    // Process app scope first so editor items follow (same menuId).
    list.sort((a, b) => (a.scope === 'app' && b.scope !== 'app' ? -1 : a.scope !== 'app' && b.scope === 'app' ? 1 : 0));

    for (const entry of list) {
      if (entry.target != null && entry.target !== target) continue;
      const matchesScope =
        entry.scope === 'app' ||
        (entry.scope === 'editor' && entry.context.editorId === activeEditorId);
      if (!matchesScope) continue;

      const existing = byMenuId.get(entry.menuId);
      const items = existing ? [...existing.items, ...entry.items] : [...entry.items];
      byMenuId.set(entry.menuId, { label: entry.label, items });
    }

    const result: EditorMenubarMenu[] = [];
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

/** Subscribe to merged menus for a target and active editor. Memoizes result so getSnapshot is stable. */
export function useMenuRegistry(target: string | undefined, activeEditorId: string | null): EditorMenubarMenu[] {
  const entries = useMenuRegistryStore((s) => s.entries);
  return React.useMemo(
    () => useMenuRegistryStore.getState().getMenusForTarget(target, activeEditorId),
    [entries, target, activeEditorId]
  );
}

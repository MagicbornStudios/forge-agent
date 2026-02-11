'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { EditorMenubarMenu } from '@forge/shared/components/editor';

type AppMenubarContextValue = {
  editorMenus: EditorMenubarMenu[];
  setEditorMenus: (menus: EditorMenubarMenu[]) => void;
};

const AppMenubarContext = createContext<AppMenubarContextValue | null>(null);

const areMenuItemsEqual = (left: EditorMenubarMenu['items'][number], right: EditorMenubarMenu['items'][number]) => {
  return (
    left.id === right.id &&
    left.label === right.label &&
    left.disabled === right.disabled &&
    left.shortcut === right.shortcut &&
    left.type === right.type
  );
};

const areMenusEqual = (prev: EditorMenubarMenu[] | null | undefined, next: EditorMenubarMenu[] | null | undefined) => {
  if (prev === next) return true;
  if (!prev || !next) return false;
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    const prevMenu = prev[i];
    const nextMenu = next[i];
    if (!prevMenu || !nextMenu) return false;
    if (prevMenu.id !== nextMenu.id || prevMenu.label !== nextMenu.label) return false;
    if (prevMenu.items.length !== nextMenu.items.length) return false;
    for (let j = 0; j < prevMenu.items.length; j += 1) {
      if (!areMenuItemsEqual(prevMenu.items[j], nextMenu.items[j])) return false;
    }
  }
  return true;
};

export function AppMenubarProvider({ children }: { children: React.ReactNode }) {
  const [editorMenus, setEditorMenus] = useState<EditorMenubarMenu[]>([]);
  const value = useMemo<AppMenubarContextValue>(
    () => ({ editorMenus, setEditorMenus }),
    [editorMenus],
  );
  return (
    <AppMenubarContext.Provider value={value}>
      {children}
    </AppMenubarContext.Provider>
  );
}

/** Alias for AppMenubarProvider; Studio owns the menubar and menu registry. */
export const StudioMenubarProvider = AppMenubarProvider;

export function useAppMenubar(): AppMenubarContextValue {
  const ctx = useContext(AppMenubarContext);
  if (ctx == null) {
    throw new Error('useAppMenubar must be used within AppMenubarProvider');
  }
  return ctx;
}

export function useAppMenubarContribution(menus: EditorMenubarMenu[]): void {
  const { setEditorMenus } = useAppMenubar();
  const menusRef = useRef<EditorMenubarMenu[]>(menus);

  useEffect(() => {
    menusRef.current = menus;
    setEditorMenus((prev) => (areMenusEqual(prev, menus) ? prev : menus));
  }, [menus, setEditorMenus]);

  useEffect(() => {
    return () => {
      setEditorMenus((prev) => (areMenusEqual(prev, menusRef.current) ? [] : prev));
    };
  }, [setEditorMenus]);
}

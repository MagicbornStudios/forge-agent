'use client';

import * as React from 'react';
import { usePanelRegistration } from '@forge/shared/components/editor';
import { createEditorMenubarMenus, type CreateEditorMenubarMenusOptions } from '@forge/shared/components/editor';
import type { EditorMenubarItem } from '@forge/shared/components/editor';
import { useMenuRegistryStore } from '@/lib/editor-registry/menu-registry';

export interface EditorMenubarMenuSlotProps {
  id: string;
  label: string;
  items: EditorMenubarItem[];
}

/**
 * Declarative slot for a single menu (File, View, etc.). Use as child of EditorMenubarContribution.
 * Does not render; used only to supply menu data.
 */
export function EditorMenubarMenuSlot(_props: EditorMenubarMenuSlotProps) {
  return null;
}

function isMenuSlotChild(
  child: React.ReactNode
): child is React.ReactElement<EditorMenubarMenuSlotProps> {
  return React.isValidElement(child) && child.type === EditorMenubarMenuSlot;
}

const STUDIO_MENUBAR_TARGET = 'studio-menubar';

/**
 * Collects EditorMenubarMenuSlot children, builds menus, and registers them with the menu
 * registry (scope=editor, target=studio-menubar). Clears on unmount. Must be used within
 * EditorLayoutProvider so the correct editor's menus are shown and cleared when switching.
 */
export function EditorMenubarContribution({ children }: { children?: React.ReactNode }) {
  const { editorId } = usePanelRegistration();
  const registerMenu = useMenuRegistryStore((s) => s.registerMenu);
  const unregisterMenu = useMenuRegistryStore((s) => s.unregisterMenu);

  const menus = React.useMemo(() => {
    const options: CreateEditorMenubarMenusOptions = {};
    React.Children.forEach(children, (child) => {
      if (isMenuSlotChild(child)) {
        const { id, label, items } = child.props;
        const key = id as keyof CreateEditorMenubarMenusOptions;
        if (key === 'file' || key === 'view' || key === 'edit' || key === 'state' || key === 'settings' || key === 'help') {
          (options as Record<string, EditorMenubarItem[]>)[key] = items;
        } else if (id && items?.length) {
          (options.extra ??= []).push({ id, label, items });
        }
      }
    });
    return createEditorMenubarMenus(options);
  }, [children]);

  React.useEffect(() => {
    const context = { editorId };
    for (const menu of menus) {
      registerMenu('editor', context, menu.id, menu.items, {
        label: menu.label,
        target: STUDIO_MENUBAR_TARGET,
      });
    }
    return () => {
      for (const menu of menus) {
        unregisterMenu('editor', context, menu.id);
      }
    };
  }, [editorId, menus, registerMenu, unregisterMenu]);

  return null;
}

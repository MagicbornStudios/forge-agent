'use client';

import * as React from 'react';
import { usePanelRegistration } from '@forge/shared/components/editor';
import { createEditorMenubarMenus, type CreateEditorMenubarMenusOptions } from '@forge/shared/components/editor';
import type { EditorMenubarItem } from '@forge/shared/components/editor';
import { useMenuRegistryStore } from '@/lib/workspace-registry/workspace-menu-registry';

export interface WorkspaceMenubarMenuSlotProps {
  id: string;
  label: string;
  items: EditorMenubarItem[];
}

/**
 * Declarative slot for a single menu (File, View, etc.). Use as child of WorkspaceMenubarContribution.
 * Does not render; used only to supply menu data.
 */
export function WorkspaceMenubarMenuSlot(_props: WorkspaceMenubarMenuSlotProps) {
  return null;
}

function isMenuSlotChild(
  child: React.ReactNode
): child is React.ReactElement<WorkspaceMenubarMenuSlotProps> {
  return React.isValidElement(child) && child.type === WorkspaceMenubarMenuSlot;
}

const STUDIO_MENUBAR_TARGET = 'studio-menubar';

/**
 * Collects WorkspaceMenubarMenuSlot children, builds menus, and registers them with the menu
 * registry (scope=editor, target=studio-menubar). Clears on unmount. Must be used within
 * WorkspaceContextProvider so the correct editor's menus are shown and cleared when switching.
 */
export function WorkspaceMenubarContribution({ children }: { children?: React.ReactNode }) {
  const { workspaceId } = usePanelRegistration();
  const registerMenu = useMenuRegistryStore((s) => s.registerMenu);
  const unregisterMenu = useMenuRegistryStore((s) => s.unregisterMenu);

  const menus = React.useMemo(() => {
    const options: CreateEditorMenubarMenusOptions = { file: [] };
    React.Children.forEach(children, (child) => {
      if (isMenuSlotChild(child)) {
        const { id, label, items } = child.props;
        const key = id as keyof CreateEditorMenubarMenusOptions;
        if (key === 'file') {
          options.file = items;
        } else if (key === 'view') {
          options.view = items;
        } else if (key === 'edit') {
          options.edit = items;
        } else if (key === 'state') {
          options.state = items;
        } else if (key === 'settings') {
          options.settings = items;
        } else if (key === 'help') {
          options.help = items;
        } else if (id && items?.length) {
          (options.extra ??= []).push({ id, label, items });
        }
      }
    });
    return createEditorMenubarMenus(options);
  }, [children]);

  React.useEffect(() => {
    const context = { workspaceId };
    for (const menu of menus) {
      registerMenu('workspace', context, menu.id, menu.items, {
        label: menu.label,
        target: STUDIO_MENUBAR_TARGET,
      });
    }
    return () => {
      for (const menu of menus) {
        unregisterMenu('workspace', context, menu.id);
      }
    };
  }, [workspaceId, menus, registerMenu, unregisterMenu]);

  return null;
}

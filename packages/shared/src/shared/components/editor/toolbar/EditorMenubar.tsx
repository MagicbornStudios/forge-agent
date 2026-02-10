'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@forge/ui/menubar';

export type EditorMenubarItem = {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: string;
  type?: 'separator';
};

export type EditorMenubarMenu = {
  id: string;
  label: string;
  items: EditorMenubarItem[];
};

const MENUBAR_SLOT_ORDER = ['file', 'view', 'edit', 'state', 'settings', 'help'] as const;
const MENUBAR_SLOT_LABELS: Record<(typeof MENUBAR_SLOT_ORDER)[number], string> = {
  file: 'File',
  view: 'View',
  edit: 'Edit',
  state: 'State',
  settings: 'Settings',
  help: 'Help',
};

type MenubarSlotId = (typeof MENUBAR_SLOT_ORDER)[number];

interface EditorMenubarSlotProps {
  items: EditorMenubarItem[];
}

function EditorMenubarFile(_props: EditorMenubarSlotProps) {
  return null;
}
EditorMenubarFile.displayName = 'EditorMenubar.File';

function EditorMenubarView(_props: EditorMenubarSlotProps) {
  return null;
}
EditorMenubarView.displayName = 'EditorMenubar.View';

function EditorMenubarEdit(_props: EditorMenubarSlotProps) {
  return null;
}
EditorMenubarEdit.displayName = 'EditorMenubar.Edit';

function EditorMenubarState(_props: EditorMenubarSlotProps) {
  return null;
}
EditorMenubarState.displayName = 'EditorMenubar.State';

function EditorMenubarSettings(_props: EditorMenubarSlotProps) {
  return null;
}
EditorMenubarSettings.displayName = 'EditorMenubar.Settings';

function EditorMenubarHelp(_props: EditorMenubarSlotProps) {
  return null;
}
EditorMenubarHelp.displayName = 'EditorMenubar.Help';

const SLOT_COMPONENTS: Record<MenubarSlotId, React.ComponentType<EditorMenubarSlotProps>> = {
  file: EditorMenubarFile,
  view: EditorMenubarView,
  edit: EditorMenubarEdit,
  state: EditorMenubarState,
  settings: EditorMenubarSettings,
  help: EditorMenubarHelp,
};

function collectMenubarSlots(children: React.ReactNode): Partial<Record<MenubarSlotId, EditorMenubarItem[]>> {
  const collected: Partial<Record<MenubarSlotId, EditorMenubarItem[]>> = {};
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<EditorMenubarSlotProps>;
    for (const slotId of MENUBAR_SLOT_ORDER) {
      if (type === SLOT_COMPONENTS[slotId]) {
        const items = (child.props as EditorMenubarSlotProps).items;
        collected[slotId] = Array.isArray(items) ? items : [];
        break;
      }
    }
  });
  return collected;
}

function hasMenubarSlots(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<EditorMenubarSlotProps>;
    for (const slotId of MENUBAR_SLOT_ORDER) {
      if (type === SLOT_COMPONENTS[slotId]) {
        found = true;
        return;
      }
    }
  });
  return found;
}

function renderMenuItems(items: EditorMenubarItem[]) {
  return items.map((item) =>
    item.type === 'separator' ? (
      <MenubarSeparator key={item.id} />
    ) : (
      <MenubarItem
        key={item.id}
        disabled={item.disabled}
        onSelect={item.onSelect}
                  className={cn(
                    'flex min-w-0 items-center gap-[var(--control-gap)] px-[var(--control-padding-x)] py-[var(--control-padding-y)] text-xs'
                  )}
                >
                  {item.icon != null && (
                    <span
                      className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)]"
                      aria-hidden
                    >
                      {item.icon}
                    </span>
                  )}
        <span className="truncate">{item.label}</span>
        {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
      </MenubarItem>
    )
  );
}

export interface EditorMenubarProps {
  /** When provided, menus are rendered in array order (legacy API). */
  menus?: EditorMenubarMenu[];
  /** When provided, slot children (EditorMenubar.File, .View, etc.) are rendered in fixed order: File, View, Edit, State, Settings, Help. */
  children?: React.ReactNode;
  className?: string;
}

export function EditorMenubar({ menus, children, className }: EditorMenubarProps) {
  const useSlots = React.useMemo(
    () => children != null && hasMenubarSlots(children),
    [children]
  );
  const slots = React.useMemo(
    () => (useSlots && children ? collectMenubarSlots(children) : {}),
    [useSlots, children]
  );

  const menuList = React.useMemo(() => {
    if (useSlots && slots) {
      const list: { id: MenubarSlotId; label: string; items: EditorMenubarItem[] }[] = [];
      for (const id of MENUBAR_SLOT_ORDER) {
        const items = slots[id];
        if (items && items.length > 0) {
          list.push({ id, label: MENUBAR_SLOT_LABELS[id], items });
        }
      }
      return list;
    }
    if (menus && menus.length > 0) {
      return menus.map((m) => ({ id: m.id as MenubarSlotId, label: m.label, items: m.items }));
    }
    return [];
  }, [useSlots, slots, menus]);

  return (
    <Menubar
      className={cn(
        'h-[var(--control-height)] border border-border/60 rounded-md bg-muted/30 px-[var(--control-padding-x)] py-[var(--control-padding-y)] shadow-[var(--shadow-sm)]',
        'gap-[var(--control-gap)]',
        className
      )}
    >
      {menuList.map((menu) => (
        <MenubarMenu key={menu.id}>
          <MenubarTrigger
            className={cn(
              'text-xs px-[var(--control-padding-x)] py-[var(--control-padding-y)]',
              'rounded-sm border border-transparent bg-transparent text-foreground',
              'hover:bg-accent/50 hover:border-border/50',
              'data-[state=open]:bg-accent data-[state=open]:border-border/50',
              'focus:bg-accent focus:border-border/50'
            )}
          >
            <span className="truncate min-w-0">{menu.label}</span>
          </MenubarTrigger>
          <MenubarContent className="py-[var(--control-padding-y)]">
            {renderMenuItems(menu.items)}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}

EditorMenubar.File = EditorMenubarFile;
EditorMenubar.View = EditorMenubarView;
EditorMenubar.Edit = EditorMenubarEdit;
EditorMenubar.State = EditorMenubarState;
EditorMenubar.Settings = EditorMenubarSettings;
EditorMenubar.Help = EditorMenubarHelp;

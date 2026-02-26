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
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@forge/ui/menubar';

export type WorkspaceMenubarItem = {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: string;
  type?: 'separator';
  /** When set, renders a submenu; label shows with chevron. */
  submenu?: WorkspaceMenubarItem[];
};

export type WorkspaceMenubarMenu = {
  id: string;
  label: string;
  items: WorkspaceMenubarItem[];
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

interface WorkspaceMenubarSlotProps {
  items: WorkspaceMenubarItem[];
}

function WorkspaceMenubarFile(_props: WorkspaceMenubarSlotProps) {
  return null;
}
WorkspaceMenubarFile.displayName = 'WorkspaceMenubar.File';

function WorkspaceMenubarView(_props: WorkspaceMenubarSlotProps) {
  return null;
}
WorkspaceMenubarView.displayName = 'WorkspaceMenubar.View';

function WorkspaceMenubarEdit(_props: WorkspaceMenubarSlotProps) {
  return null;
}
WorkspaceMenubarEdit.displayName = 'WorkspaceMenubar.Edit';

function WorkspaceMenubarState(_props: WorkspaceMenubarSlotProps) {
  return null;
}
WorkspaceMenubarState.displayName = 'WorkspaceMenubar.State';

function WorkspaceMenubarSettings(_props: WorkspaceMenubarSlotProps) {
  return null;
}
WorkspaceMenubarSettings.displayName = 'WorkspaceMenubar.Settings';

function WorkspaceMenubarHelp(_props: WorkspaceMenubarSlotProps) {
  return null;
}
WorkspaceMenubarHelp.displayName = 'WorkspaceMenubar.Help';

const SLOT_COMPONENTS: Record<MenubarSlotId, React.ComponentType<WorkspaceMenubarSlotProps>> = {
  file: WorkspaceMenubarFile,
  view: WorkspaceMenubarView,
  edit: WorkspaceMenubarEdit,
  state: WorkspaceMenubarState,
  settings: WorkspaceMenubarSettings,
  help: WorkspaceMenubarHelp,
};

function collectMenubarSlots(children: React.ReactNode): Partial<Record<MenubarSlotId, WorkspaceMenubarItem[]>> {
  const collected: Partial<Record<MenubarSlotId, WorkspaceMenubarItem[]>> = {};
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<WorkspaceMenubarSlotProps>;
    for (const slotId of MENUBAR_SLOT_ORDER) {
      if (type === SLOT_COMPONENTS[slotId]) {
        const items = (child.props as WorkspaceMenubarSlotProps).items;
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
    const type = child.type as React.ComponentType<WorkspaceMenubarSlotProps>;
    for (const slotId of MENUBAR_SLOT_ORDER) {
      if (type === SLOT_COMPONENTS[slotId]) {
        found = true;
        return;
      }
    }
  });
  return found;
}

function renderMenuItems(items: WorkspaceMenubarItem[]) {
  return items.map((item) => {
    if (item.type === 'separator') {
      return <MenubarSeparator key={item.id} />;
    }
    const itemClassName = cn(
      'flex min-w-0 items-center gap-[var(--control-gap)] rounded-sm px-[var(--menu-item-padding-x)] py-[calc(var(--menu-item-padding-y)-0.125rem)] text-[11px]'
    );
    const iconSlot =
      item.icon != null ? (
        <span
          className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)]"
          aria-hidden
        >
          {item.icon}
        </span>
      ) : null;
    if (item.submenu != null && item.submenu.length > 0) {
      return (
        <MenubarSub key={item.id}>
          <MenubarSubTrigger className={itemClassName} disabled={item.disabled}>
            {iconSlot}
            <span className="truncate">{item.label}</span>
            {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
          </MenubarSubTrigger>
          <MenubarSubContent className="py-[var(--control-padding-y)]">
            {renderMenuItems(item.submenu)}
          </MenubarSubContent>
        </MenubarSub>
      );
    }
    return (
      <MenubarItem
        key={item.id}
        disabled={item.disabled}
        onSelect={item.onSelect}
        className={itemClassName}
      >
        {iconSlot}
        <span className="truncate">{item.label}</span>
        {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
      </MenubarItem>
    );
  });
}

export interface WorkspaceMenubarProps {
  /** When provided, menus are rendered in array order (legacy API). */
  menus?: WorkspaceMenubarMenu[];
  /** When provided, slot children (WorkspaceMenubar.File, .View, etc.) are rendered in fixed order: File, View, Edit, State, Settings, Help. */
  children?: React.ReactNode;
  className?: string;
}

export function WorkspaceMenubar({ menus, children, className }: WorkspaceMenubarProps) {
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
      const list: { id: MenubarSlotId; label: string; items: WorkspaceMenubarItem[] }[] = [];
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
        'min-h-[var(--control-height-sm)] rounded-md border border-border/60 bg-background/90 px-[2px] py-[2px] shadow-[var(--shadow-xs)]',
        'gap-[var(--control-gap)] backdrop-blur-[1px]',
        className
      )}
    >
      {menuList.map((menu) => (
        <MenubarMenu key={menu.id}>
          <MenubarTrigger
            className={cn(
              'h-[calc(var(--control-height-sm)-0.25rem)] rounded-sm border border-transparent bg-transparent px-[calc(var(--control-padding-x)-0.125rem)] py-0 text-[11px] font-medium text-foreground',
              'hover:bg-accent/60 hover:border-border/50',
              'data-[state=open]:bg-accent data-[state=open]:border-border/60',
              'focus:bg-accent focus:border-border/60'
            )}
          >
            <span className="truncate min-w-0">{menu.label}</span>
          </MenubarTrigger>
          <MenubarContent className="py-[var(--menu-content-padding)]">
            {renderMenuItems(menu.items)}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}

WorkspaceMenubar.File = WorkspaceMenubarFile;
WorkspaceMenubar.View = WorkspaceMenubarView;
WorkspaceMenubar.Edit = WorkspaceMenubarEdit;
WorkspaceMenubar.State = WorkspaceMenubarState;
WorkspaceMenubar.Settings = WorkspaceMenubarSettings;
WorkspaceMenubar.Help = WorkspaceMenubarHelp;

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

export interface EditorMenubarProps {
  menus: EditorMenubarMenu[];
  className?: string;
}

export function EditorMenubar({ menus, className }: EditorMenubarProps) {
  return (
    <Menubar className={cn('h-8 border-none bg-transparent p-0 shadow-none', className)}>
      {menus.map((menu) => (
        <MenubarMenu key={menu.id}>
          <MenubarTrigger className="border border-border bg-transparent hover:bg-accent/50 text-foreground">
            {menu.label}
          </MenubarTrigger>
          <MenubarContent>
            {menu.items.map((item) =>
              item.type === 'separator' ? (
                <MenubarSeparator key={item.id} />
              ) : (
                <MenubarItem
                  key={item.id}
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                  className="flex items-center gap-2"
                >
                  {item.icon != null && (
                    <span className="flex shrink-0 size-4 [&>svg]:size-4">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                  {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
                </MenubarItem>
              )
            )}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}

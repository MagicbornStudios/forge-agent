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
    <Menubar
      className={cn(
        'h-[var(--control-height)] border border-border/60 rounded-md bg-muted/30 px-[var(--control-padding-x)] py-[var(--control-padding-y)] shadow-[var(--shadow-sm)]',
        'gap-[var(--control-gap)]',
        className
      )}
    >
      {menus.map((menu) => (
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
            {menu.items.map((item) =>
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
                    <span className="flex shrink-0 size-3 [&>svg]:size-3" aria-hidden>{item.icon}</span>
                  )}
                  <span className="truncate">{item.label}</span>
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

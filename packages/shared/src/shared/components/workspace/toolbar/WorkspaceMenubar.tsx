"use client";

import * as React from "react";
import { cn } from "@forge/shared/lib/utils";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@forge/ui/menubar";

export type WorkspaceMenubarItem = {
  id: string;
  label?: string;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: string;
  type?: "separator";
};

export type WorkspaceMenubarMenu = {
  id: string;
  label: string;
  items: WorkspaceMenubarItem[];
};

export interface WorkspaceMenubarProps {
  menus: WorkspaceMenubarMenu[];
  className?: string;
}

export function WorkspaceMenubar({ menus, className }: WorkspaceMenubarProps) {
  return (
    <Menubar className={cn("h-8 border-none bg-transparent p-0 shadow-none", className)}>
      {menus.map((menu) => (
        <MenubarMenu key={menu.id}>
          <MenubarTrigger>{menu.label}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map((item) =>
              item.type === "separator" ? (
                <MenubarSeparator key={item.id} />
              ) : (
                <MenubarItem key={item.id} disabled={item.disabled} onSelect={item.onSelect}>
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

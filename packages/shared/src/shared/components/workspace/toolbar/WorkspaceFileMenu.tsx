"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceButton } from "../controls/WorkspaceButton";

export type WorkspaceFileMenuItem =
  | {
      id: string;
      label: string;
      onSelect?: () => void;
      disabled?: boolean;
      shortcut?: string;
      variant?: "default" | "destructive";
    }
  | { id: string; type: "separator" };

export interface WorkspaceFileMenuProps {
  items: WorkspaceFileMenuItem[];
  trigger?: React.ReactNode;
  tooltip?: React.ReactNode;
}

function isSeparator(item: WorkspaceFileMenuItem): item is { id: string; type: "separator" } {
  return "type" in item && item.type === "separator";
}

export function WorkspaceFileMenu({ items, trigger, tooltip = "File menu" }: WorkspaceFileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <WorkspaceButton variant="ghost" size="sm" tooltip={tooltip}>
            File
          </WorkspaceButton>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) =>
          isSeparator(item) ? (
            <DropdownMenuSeparator key={item.id} />
          ) : (
            <DropdownMenuItem
              key={item.id}
              disabled={item.disabled}
              onSelect={() => item.onSelect?.()}
              className={item.variant === "destructive" ? "text-destructive" : undefined}
            >
              {item.label}
              {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

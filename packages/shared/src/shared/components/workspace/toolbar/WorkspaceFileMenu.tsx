'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@forge/ui/dropdown-menu';
import { WorkspaceButton } from '../WorkspaceButton';
import type { WorkspaceMenubarItem } from './WorkspaceMenubar';

export type WorkspaceFileMenuItem =
  | {
      id: string;
      label: string;
      icon?: React.ReactNode;
      onSelect?: () => void;
      disabled?: boolean;
      shortcut?: string;
      variant?: 'default' | 'destructive';
    }
  | { id: string; type: 'separator' };

export interface WorkspaceFileMenuProps {
  items: WorkspaceFileMenuItem[];
  trigger?: React.ReactNode;
  tooltip?: string;
}

function isSeparator(item: WorkspaceFileMenuItem): item is { id: string; type: 'separator' } {
  return 'type' in item && item.type === 'separator';
}

export function WorkspaceFileMenu({
  items,
  trigger,
  tooltip = 'File menu',
}: WorkspaceFileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <WorkspaceButton variant="outline" size="sm" tooltip={tooltip} className="border-0">
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
              className={cn(
                'flex items-center gap-[var(--control-gap)]',
                item.variant === 'destructive' && 'text-destructive'
              )}
            >
              {item.icon != null && (
                <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)]">{item.icon}</span>
              )}
              {item.label}
              {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Compound item builders for File menu (return WorkspaceMenubarItem for use in WorkspaceMenubar or createWorkspaceMenubarMenus) ---

export interface WorkspaceFileMenuSwitchProjectOptions {
  onSelect?: () => void;
}

export function WorkspaceFileMenuSwitchProject(options?: WorkspaceFileMenuSwitchProjectOptions): WorkspaceMenubarItem {
  return {
    id: 'file-switch-project',
    label: 'Switch project',
    onSelect: options?.onSelect,
  };
}

export interface WorkspaceFileMenuActionOptions {
  onSelect?: () => void;
  shortcut?: string;
}

export function WorkspaceFileMenuNew(options?: WorkspaceFileMenuActionOptions): WorkspaceMenubarItem {
  return {
    id: 'file-new',
    label: 'New',
    shortcut: options?.shortcut,
    onSelect: options?.onSelect,
  };
}

export function WorkspaceFileMenuOpen(options?: WorkspaceFileMenuActionOptions): WorkspaceMenubarItem {
  return {
    id: 'file-open',
    label: 'Open…',
    shortcut: options?.shortcut,
    onSelect: options?.onSelect,
  };
}

export function WorkspaceFileMenuSave(options?: WorkspaceFileMenuActionOptions): WorkspaceMenubarItem {
  return {
    id: 'file-save',
    label: 'Save',
    shortcut: options?.shortcut ?? 'Ctrl+S',
    onSelect: options?.onSelect,
  };
}

export function WorkspaceFileMenuSeparator(id?: string): WorkspaceMenubarItem {
  return {
    id: id ?? 'file-sep',
    type: 'separator',
  };
}

WorkspaceFileMenu.SwitchProject = WorkspaceFileMenuSwitchProject;
WorkspaceFileMenu.New = WorkspaceFileMenuNew;
WorkspaceFileMenu.Open = WorkspaceFileMenuOpen;
WorkspaceFileMenu.Save = WorkspaceFileMenuSave;
WorkspaceFileMenu.Separator = WorkspaceFileMenuSeparator;

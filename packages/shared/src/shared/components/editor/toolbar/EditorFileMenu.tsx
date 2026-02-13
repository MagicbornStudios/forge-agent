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
import { EditorButton } from '../EditorButton';
import type { EditorMenubarItem } from './EditorMenubar';

export type EditorFileMenuItem =
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

export interface EditorFileMenuProps {
  items: EditorFileMenuItem[];
  trigger?: React.ReactNode;
  tooltip?: string;
}

function isSeparator(item: EditorFileMenuItem): item is { id: string; type: 'separator' } {
  return 'type' in item && item.type === 'separator';
}

export function EditorFileMenu({
  items,
  trigger,
  tooltip = 'File menu',
}: EditorFileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <EditorButton variant="outline" size="sm" tooltip={tooltip} className="border-0">
            File
          </EditorButton>
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

// --- Compound item builders for File menu (return EditorMenubarItem for use in EditorMenubar or createEditorMenubarMenus) ---

export interface EditorFileMenuSwitchProjectOptions {
  onSelect?: () => void;
}

export function EditorFileMenuSwitchProject(options?: EditorFileMenuSwitchProjectOptions): EditorMenubarItem {
  return {
    id: 'file-switch-project',
    label: 'Switch project',
    onSelect: options?.onSelect,
  };
}

export interface EditorFileMenuActionOptions {
  onSelect?: () => void;
  shortcut?: string;
}

export function EditorFileMenuNew(options?: EditorFileMenuActionOptions): EditorMenubarItem {
  return {
    id: 'file-new',
    label: 'New',
    shortcut: options?.shortcut,
    onSelect: options?.onSelect,
  };
}

export function EditorFileMenuOpen(options?: EditorFileMenuActionOptions): EditorMenubarItem {
  return {
    id: 'file-open',
    label: 'Open…',
    shortcut: options?.shortcut,
    onSelect: options?.onSelect,
  };
}

export function EditorFileMenuSave(options?: EditorFileMenuActionOptions): EditorMenubarItem {
  return {
    id: 'file-save',
    label: 'Save',
    shortcut: options?.shortcut ?? 'Ctrl+S',
    onSelect: options?.onSelect,
  };
}

export function EditorFileMenuSeparator(id?: string): EditorMenubarItem {
  return {
    id: id ?? 'file-sep',
    type: 'separator',
  };
}

EditorFileMenu.SwitchProject = EditorFileMenuSwitchProject;
EditorFileMenu.New = EditorFileMenuNew;
EditorFileMenu.Open = EditorFileMenuOpen;
EditorFileMenu.Save = EditorFileMenuSave;
EditorFileMenu.Separator = EditorFileMenuSeparator;

'use client';

import type { WorkspaceMenubarItem } from './WorkspaceMenubar';

/**
 * Item builders for the Edit menu. Use with createWorkspaceMenubarMenus({ edit: [...] }) or WorkspaceMenubar.Edit.
 */

export interface WorkspaceEditMenuItemOptions {
  onSelect?: () => void;
  shortcut?: string;
  disabled?: boolean;
}

export function WorkspaceEditMenuUndo(options?: WorkspaceEditMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'edit-undo',
    label: 'Undo',
    shortcut: options?.shortcut ?? 'Ctrl+Z',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function WorkspaceEditMenuRedo(options?: WorkspaceEditMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'edit-redo',
    label: 'Redo',
    shortcut: options?.shortcut ?? 'Ctrl+Y',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function WorkspaceEditMenuSeparator(id?: string): WorkspaceMenubarItem {
  return { id: id ?? 'edit-sep', type: 'separator' };
}

export function WorkspaceEditMenuCut(options?: WorkspaceEditMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'edit-cut',
    label: 'Cut',
    shortcut: options?.shortcut ?? 'Ctrl+X',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function WorkspaceEditMenuCopy(options?: WorkspaceEditMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'edit-copy',
    label: 'Copy',
    shortcut: options?.shortcut ?? 'Ctrl+C',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function WorkspaceEditMenuPaste(options?: WorkspaceEditMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'edit-paste',
    label: 'Paste',
    shortcut: options?.shortcut ?? 'Ctrl+V',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function WorkspaceEditMenuFind(options?: WorkspaceEditMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'edit-find',
    label: 'Find',
    shortcut: options?.shortcut ?? 'Ctrl+F',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function WorkspaceEditMenuReplace(options?: WorkspaceEditMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'edit-replace',
    label: 'Replace',
    shortcut: options?.shortcut ?? 'Ctrl+H',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export const WorkspaceEditMenu = {
  Undo: WorkspaceEditMenuUndo,
  Redo: WorkspaceEditMenuRedo,
  Separator: WorkspaceEditMenuSeparator,
  Cut: WorkspaceEditMenuCut,
  Copy: WorkspaceEditMenuCopy,
  Paste: WorkspaceEditMenuPaste,
  Find: WorkspaceEditMenuFind,
  Replace: WorkspaceEditMenuReplace,
};

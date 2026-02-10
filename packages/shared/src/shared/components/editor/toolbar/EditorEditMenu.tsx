'use client';

import type { EditorMenubarItem } from './EditorMenubar';

/**
 * Item builders for the Edit menu. Use with createEditorMenubarMenus({ edit: [...] }) or EditorMenubar.Edit.
 */

export interface EditorEditMenuItemOptions {
  onSelect?: () => void;
  shortcut?: string;
  disabled?: boolean;
}

export function EditorEditMenuUndo(options?: EditorEditMenuItemOptions): EditorMenubarItem {
  return {
    id: 'edit-undo',
    label: 'Undo',
    shortcut: options?.shortcut ?? 'Ctrl+Z',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function EditorEditMenuRedo(options?: EditorEditMenuItemOptions): EditorMenubarItem {
  return {
    id: 'edit-redo',
    label: 'Redo',
    shortcut: options?.shortcut ?? 'Ctrl+Y',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function EditorEditMenuSeparator(id?: string): EditorMenubarItem {
  return { id: id ?? 'edit-sep', type: 'separator' };
}

export function EditorEditMenuCut(options?: EditorEditMenuItemOptions): EditorMenubarItem {
  return {
    id: 'edit-cut',
    label: 'Cut',
    shortcut: options?.shortcut ?? 'Ctrl+X',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function EditorEditMenuCopy(options?: EditorEditMenuItemOptions): EditorMenubarItem {
  return {
    id: 'edit-copy',
    label: 'Copy',
    shortcut: options?.shortcut ?? 'Ctrl+C',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function EditorEditMenuPaste(options?: EditorEditMenuItemOptions): EditorMenubarItem {
  return {
    id: 'edit-paste',
    label: 'Paste',
    shortcut: options?.shortcut ?? 'Ctrl+V',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function EditorEditMenuFind(options?: EditorEditMenuItemOptions): EditorMenubarItem {
  return {
    id: 'edit-find',
    label: 'Find',
    shortcut: options?.shortcut ?? 'Ctrl+F',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export function EditorEditMenuReplace(options?: EditorEditMenuItemOptions): EditorMenubarItem {
  return {
    id: 'edit-replace',
    label: 'Replace',
    shortcut: options?.shortcut ?? 'Ctrl+H',
    onSelect: options?.onSelect,
    disabled: options?.disabled,
  };
}

export const EditorEditMenu = {
  Undo: EditorEditMenuUndo,
  Redo: EditorEditMenuRedo,
  Separator: EditorEditMenuSeparator,
  Cut: EditorEditMenuCut,
  Copy: EditorEditMenuCopy,
  Paste: EditorEditMenuPaste,
  Find: EditorEditMenuFind,
  Replace: EditorEditMenuReplace,
};

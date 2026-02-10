'use client';

import type { EditorMenubarItem } from './EditorMenubar';

/**
 * Item builders for the Help menu. Use with createEditorMenubarMenus({ help: [...] }) or EditorMenubar.Help.
 */

export interface EditorHelpMenuItemOptions {
  onSelect?: () => void;
  shortcut?: string;
}

export function EditorHelpMenuWelcome(options?: EditorHelpMenuItemOptions): EditorMenubarItem {
  return {
    id: 'help-welcome',
    label: 'Welcome',
    onSelect: options?.onSelect,
  };
}

export function EditorHelpMenuShowCommands(options?: EditorHelpMenuItemOptions): EditorMenubarItem {
  return {
    id: 'help-commands',
    label: 'Show All Commands',
    shortcut: options?.shortcut ?? 'Ctrl+Shift+P',
    onSelect: options?.onSelect,
  };
}

export function EditorHelpMenuAbout(options?: EditorHelpMenuItemOptions): EditorMenubarItem {
  return {
    id: 'help-about',
    label: 'About',
    onSelect: options?.onSelect,
  };
}

export function EditorHelpMenuSeparator(id?: string): EditorMenubarItem {
  return {
    id: id ?? 'help-sep',
    type: 'separator',
  };
}

export const EditorHelpMenu = {
  Welcome: EditorHelpMenuWelcome,
  ShowCommands: EditorHelpMenuShowCommands,
  About: EditorHelpMenuAbout,
  Separator: EditorHelpMenuSeparator,
};

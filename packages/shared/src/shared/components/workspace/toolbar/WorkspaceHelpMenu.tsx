'use client';

import type { WorkspaceMenubarItem } from './WorkspaceMenubar';

/**
 * Item builders for the Help menu. Use with createWorkspaceMenubarMenus({ help: [...] }) or WorkspaceMenubar.Help.
 */

export interface WorkspaceHelpMenuItemOptions {
  onSelect?: () => void;
  shortcut?: string;
}

export function WorkspaceHelpMenuWelcome(options?: WorkspaceHelpMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'help-welcome',
    label: 'Welcome',
    onSelect: options?.onSelect,
  };
}

export function WorkspaceHelpMenuShowCommands(options?: WorkspaceHelpMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'help-commands',
    label: 'Show All Commands',
    shortcut: options?.shortcut ?? 'Ctrl+Shift+P',
    onSelect: options?.onSelect,
  };
}

export function WorkspaceHelpMenuAbout(options?: WorkspaceHelpMenuItemOptions): WorkspaceMenubarItem {
  return {
    id: 'help-about',
    label: 'About',
    onSelect: options?.onSelect,
  };
}

export function WorkspaceHelpMenuSeparator(id?: string): WorkspaceMenubarItem {
  return {
    id: id ?? 'help-sep',
    type: 'separator',
  };
}

export const WorkspaceHelpMenu = {
  Welcome: WorkspaceHelpMenuWelcome,
  ShowCommands: WorkspaceHelpMenuShowCommands,
  About: WorkspaceHelpMenuAbout,
  Separator: WorkspaceHelpMenuSeparator,
};

'use client';

import type { WorkspaceMenubarItem } from './WorkspaceMenubar';

/**
 * Item builders for the View menu. Use with createWorkspaceMenubarMenus({ view: [...] }) or WorkspaceMenubar.View.
 */

export interface WorkspaceViewMenuAppearanceOptions {
  /** Theme/density items or a function that returns items (e.g. from useViewAppearanceItems). */
  items: WorkspaceMenubarItem[];
}

/**
 * Returns View menu items for an "Appearance" section (theme, density).
 * Pass the result of a hook or build items array and spread into view items.
 */
export function WorkspaceViewMenuAppearance(options: WorkspaceViewMenuAppearanceOptions): WorkspaceMenubarItem[] {
  return options.items;
}

export interface WorkspaceViewMenuPanelToggleOptions {
  id: string;
  label: string;
  checked?: boolean;
  onSelect?: () => void;
}

export function WorkspaceViewMenuPanelToggle(options: WorkspaceViewMenuPanelToggleOptions): WorkspaceMenubarItem {
  const { id, label, checked, onSelect } = options;
  return {
    id: `view-panel-${id}`,
    label: checked === false ? `Show ${label}` : `Hide ${label}`,
    onSelect,
  };
}

export function WorkspaceViewMenuSeparator(itemId?: string): WorkspaceMenubarItem {
  return {
    id: itemId ?? 'view-sep',
    type: 'separator',
  };
}

export const WorkspaceViewMenu = {
  Appearance: WorkspaceViewMenuAppearance,
  PanelToggle: WorkspaceViewMenuPanelToggle,
  Separator: WorkspaceViewMenuSeparator,
};

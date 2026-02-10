'use client';

import type { EditorMenubarItem } from './EditorMenubar';

/**
 * Item builders for the View menu. Use with createEditorMenubarMenus({ view: [...] }) or EditorMenubar.View.
 */

export interface EditorViewMenuAppearanceOptions {
  /** Theme/density items or a function that returns items (e.g. from useViewAppearanceItems). */
  items: EditorMenubarItem[];
}

/**
 * Returns View menu items for an "Appearance" section (theme, density).
 * Pass the result of a hook or build items array and spread into view items.
 */
export function EditorViewMenuAppearance(options: EditorViewMenuAppearanceOptions): EditorMenubarItem[] {
  return options.items;
}

export interface EditorViewMenuPanelToggleOptions {
  id: string;
  label: string;
  checked?: boolean;
  onSelect?: () => void;
}

export function EditorViewMenuPanelToggle(options: EditorViewMenuPanelToggleOptions): EditorMenubarItem {
  const { id, label, checked, onSelect } = options;
  return {
    id: `view-panel-${id}`,
    label: checked === false ? `Show ${label}` : `Hide ${label}`,
    onSelect,
  };
}

export function EditorViewMenuSeparator(itemId?: string): EditorMenubarItem {
  return {
    id: itemId ?? 'view-sep',
    type: 'separator',
  };
}

export const EditorViewMenu = {
  Appearance: EditorViewMenuAppearance,
  PanelToggle: EditorViewMenuPanelToggle,
  Separator: EditorViewMenuSeparator,
};

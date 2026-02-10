'use client';

import * as React from 'react';
import type { EditorMenubarItem } from './EditorMenubar';

/**
 * Item builders for the Settings menu. Use with createEditorMenubarMenus({ settings: [...] }) or EditorMenubar.Settings.
 * OpenSettings opens the single app settings sheet (wire via useSettingsTrigger or useOpenSettingsSheet in the app).
 */

export interface EditorSettingsMenuOpenSettingsOptions {
  onSelect?: () => void;
}

export function EditorSettingsMenuOpenSettings(options?: EditorSettingsMenuOpenSettingsOptions): EditorMenubarItem {
  return {
    id: 'settings-open',
    label: 'Open Settings',
    onSelect: options?.onSelect,
  };
}

export interface EditorSettingsMenuUserOptions {
  label?: string;
  onSelect?: () => void;
  icon?: React.ReactNode;
}

export function EditorSettingsMenuUser(options?: EditorSettingsMenuUserOptions): EditorMenubarItem {
  return {
    id: 'settings-user',
    label: options?.label ?? 'Account',
    icon: options?.icon,
    onSelect: options?.onSelect,
  };
}

export function EditorSettingsMenuSeparator(id?: string): EditorMenubarItem {
  return {
    id: id ?? 'settings-sep',
    type: 'separator',
  };
}

export const EditorSettingsMenu = {
  OpenSettings: EditorSettingsMenuOpenSettings,
  User: EditorSettingsMenuUser,
  Separator: EditorSettingsMenuSeparator,
};

'use client';

import * as React from 'react';
import type { WorkspaceMenubarItem } from './WorkspaceMenubar';

/**
 * Item builders for the Settings menu. Use with createWorkspaceMenubarMenus({ settings: [...] }) or WorkspaceMenubar.Settings.
 * OpenSettings opens the single app settings sheet (wire via useSettingsTrigger or useOpenSettingsSheet in the app).
 */

export interface WorkspaceSettingsMenuOpenSettingsOptions {
  onSelect?: () => void;
}

export function WorkspaceSettingsMenuOpenSettings(options?: WorkspaceSettingsMenuOpenSettingsOptions): WorkspaceMenubarItem {
  return {
    id: 'settings-open',
    label: 'Open Settings',
    onSelect: options?.onSelect,
  };
}

export interface WorkspaceSettingsMenuUserOptions {
  label?: string;
  onSelect?: () => void;
  icon?: React.ReactNode;
}

export function WorkspaceSettingsMenuUser(options?: WorkspaceSettingsMenuUserOptions): WorkspaceMenubarItem {
  return {
    id: 'settings-user',
    label: options?.label ?? 'Account',
    icon: options?.icon,
    onSelect: options?.onSelect,
  };
}

export function WorkspaceSettingsMenuSeparator(id?: string): WorkspaceMenubarItem {
  return {
    id: id ?? 'settings-sep',
    type: 'separator',
  };
}

export const WorkspaceSettingsMenu = {
  OpenSettings: WorkspaceSettingsMenuOpenSettings,
  User: WorkspaceSettingsMenuUser,
  Separator: WorkspaceSettingsMenuSeparator,
};

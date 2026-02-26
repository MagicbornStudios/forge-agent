'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';
import { WorkspaceButton } from './WorkspaceButton';
import { useSettingsTrigger } from './SettingsTriggerContext';

export interface WorkspaceSettingsTriggerProps {
  /** Override tooltip when context is not provided. */
  tooltip?: string;
  className?: string;
}

/**
 * Default content for WorkspaceShell.Settings: a gear button that opens app/editor settings.
 * Provide openSettings via SettingsTriggerProvider in your app (e.g. open the app settings sheet).
 * Without context, renders a disabled-style button with tooltip "Configure settings in your app".
 */
export function WorkspaceSettingsTrigger({ tooltip, className }: WorkspaceSettingsTriggerProps) {
  const ctx = useSettingsTrigger();
  const openSettings = ctx?.openSettings;
  const handleClick = openSettings ?? (() => {});

  return (
    <WorkspaceButton
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      tooltip={tooltip ?? (openSettings ? 'Settings' : 'Configure settings in your app')}
      className={className}
      disabled={!openSettings}
      aria-label="Open settings"
    >
      <Settings className="size-[var(--icon-size)] shrink-0" />
    </WorkspaceButton>
  );
}

'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@forge/ui/tabs';
import { cn } from '@forge/shared/lib/utils';

/**
 * Tab definition for declarative settings (mirrors EditorMenubarItem pattern).
 * Use with SettingsTabs for a consistent tab strip with optional icons.
 */
export interface SettingsTabDef {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Content shown when this tab is active. */
  content: React.ReactNode;
}

export interface SettingsTabsProps {
  tabs: SettingsTabDef[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  /** Optional class for the tab list (e.g. grid layout). */
  tabsListClassName?: string;
  /** Optional class for each trigger (e.g. flex for icon + label). */
  triggerClassName?: string;
}

/**
 * Presentational settings tab strip with optional icons per tab.
 * Content is supplied per tab; use for top-level or inner category tabs.
 */
export function SettingsTabs({
  tabs,
  value,
  onValueChange,
  className,
  tabsListClassName,
  triggerClassName,
}: SettingsTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('flex flex-col min-h-0', className)}>
      <TabsList className={cn('shrink-0 w-full', tabsListClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn('flex items-center gap-[var(--control-gap)]', triggerClassName)}
            onPointerDown={
              tab.disabled
                ? undefined
                : (e) => {
                    e.currentTarget.focus();
                    onValueChange(tab.id);
                  }
            }
          >
            {tab.icon != null && (
              <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)]">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="flex-1 overflow-y-auto mt-4 min-h-0 data-[state=inactive]:hidden"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

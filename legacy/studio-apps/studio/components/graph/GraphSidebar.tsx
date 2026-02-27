'use client';

import React, { useMemo, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@forge/ui/toggle-group';
import { cn } from '@forge/shared/lib/utils';
import { WorkspaceSidebar, SidebarHeader, SidebarContent } from '@forge/shared';

export interface GraphSidebarTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  accentColor?: string;
  accentMutedColor?: string;
}

export interface GraphSidebarProps {
  tabs: GraphSidebarTab[];
  defaultTabId?: string;
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  side?: 'left' | 'right';
  className?: string;
}

/**
 * GraphSidebar — a tabbed sidebar for graph editors.
 *
 * Composes `WorkspaceSidebar` (shadcn Sidebar primitives)
 * and places the tab bar in `SidebarHeader` and active tab content in
 * `SidebarContent`.
 */
export function GraphSidebar({
  tabs,
  defaultTabId,
  activeTabId,
  onTabChange,
  side = 'left',
  className,
}: GraphSidebarProps) {
  const initialTab = useMemo(
    () => defaultTabId ?? tabs[0]?.id,
    [defaultTabId, tabs]
  );
  const [internalTab, setInternalTab] = useState(initialTab);
  const currentTab = activeTabId ?? internalTab;

  const setTab = (id: string) => {
    if (onTabChange) onTabChange(id);
    if (!activeTabId) setInternalTab(id);
  };

  const active = tabs.find((tab) => tab.id === currentTab) ?? tabs[0];

  return (
    <WorkspaceSidebar side={side} className={cn('h-full', className)}>
      <SidebarHeader className="p-0">
        <ToggleGroup
          type="single"
          value={currentTab}
          onValueChange={(value) => value && setTab(value)}
          variant="outline"
          className="w-full flex rounded-none bg-transparent h-8 px-0 gap-0 m-0 min-w-0 overflow-hidden border-b-2 border-[var(--context-accent)]"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === currentTab;
            const accent = tab.accentColor ?? 'var(--context-accent)';
            const accentMuted =
              tab.accentMutedColor ??
              'color-mix(in oklab, var(--context-accent) 40%, transparent)';

            return (
              <ToggleGroupItem
                key={tab.id}
                value={tab.id}
                aria-label={tab.label}
                className={cn(
                  'min-w-0 flex-1 text-xs rounded-none px-[var(--control-padding-x)] py-[var(--control-padding-y)] truncate leading-tight relative',
                  'text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors',
                  'data-[state=on]:bg-sidebar-accent data-[state=on]:text-sidebar-accent-foreground',
                  'border-l-2'
                )}
                style={{
                  borderLeftColor: isActive ? accent : accentMuted,
                }}
              >
                <span
                  className="mr-1 shrink-0"
                  style={{ color: isActive ? accent : accentMuted }}
                >
                  {tab.icon}
                </span>
                <span className="truncate">{tab.label}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </SidebarHeader>

      <SidebarContent className="px-0">
        {active?.content}
      </SidebarContent>
    </WorkspaceSidebar>
  );
}

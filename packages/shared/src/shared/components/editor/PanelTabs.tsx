'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@forge/ui/tabs';
import { cn } from '@forge/shared/lib/utils';

export interface PanelTabDef {
  /** Unique tab identifier. */
  id: string;
  /** Display label in the tab trigger. */
  label: string;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Tab panel content. */
  content: React.ReactNode;
  /** Optional accent color for the tab indicator/icon. */
  accentColor?: string;
  /** Whether this tab can be closed. Future: for dockable/detachable tabs. */
  closable?: boolean;
}

export interface PanelTabsProps {
  /** Tab definitions. At least one required. */
  tabs: PanelTabDef[];
  /** Which tab to show initially when uncontrolled. Defaults to first tab. */
  defaultTabId?: string;
  /** Controlled active tab. Overrides internal state when provided. */
  activeTabId?: string;
  /** Called when a tab is activated. */
  onTabChange?: (id: string) => void;
  className?: string;
}

/**
 * PanelTabs — tab bar + content within a single `DockPanel`.
 *
 * Built on shadcn `Tabs` (Radix UI). Replaces both the `GraphSidebar`
 * (app-level custom ToggleGroup) and `WorkspaceTabGroup` (shared) with
 * a unified, theme-aware tab component.
 *
 * Supports both controlled (`activeTabId` + `onTabChange`) and
 * uncontrolled (`defaultTabId`) usage.
 *
 * @example
 * ```tsx
 * <PanelTabs
 *   tabs={[
 *     { id: 'graphs', label: 'Graphs', icon: <BookOpen size={12} />, content: <GraphList /> },
 *     { id: 'nodes', label: 'Nodes', icon: <Boxes size={12} />, content: <NodePalette /> },
 *   ]}
 *   defaultTabId="graphs"
 * />
 * ```
 */
export function PanelTabs({
  tabs,
  defaultTabId,
  activeTabId,
  onTabChange,
  className,
}: PanelTabsProps) {
  const initialTab = useMemo(() => defaultTabId ?? tabs[0]?.id, [defaultTabId, tabs]);
  const [internalTab, setInternalTab] = useState(initialTab);
  const currentTab = activeTabId ?? internalTab;

  const handleChange = (value: string) => {
    if (onTabChange) onTabChange(value);
    if (!activeTabId) setInternalTab(value);
  };

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleChange}
      className={cn('flex flex-col h-full', className)}
    >
      {/* Tab triggers */}
      <TabsList
        className={cn(
          'w-full flex rounded-none bg-transparent h-[var(--tab-height)] px-0 gap-0 m-0',
          'min-w-0 overflow-hidden border-b border-border shrink-0',
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab;
          const accent = tab.accentColor ?? 'var(--context-accent, hsl(var(--primary)))';

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                'min-w-0 flex-1 text-xs rounded-none px-[var(--control-padding-x)] py-[var(--control-padding-y)] truncate leading-tight',
                'relative shadow-none ring-0 border-b-2 border-transparent',
                'bg-transparent text-foreground/80 hover:text-foreground hover:bg-accent/40 transition-colors',
                'data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:border-b-[var(--context-accent,hsl(var(--primary)))]',
              )}
              style={
                isActive
                  ? { borderBottomColor: accent }
                  : undefined
              }
            >
              {tab.icon && (
                <span
                  className="mr-1 shrink-0"
                  style={{
                    color: isActive
                      ? accent
                      : `color-mix(in oklab, ${accent} 40%, transparent)`,
                  }}
                >
                  {tab.icon}
                </span>
              )}
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab content panels */}
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="flex-1 min-h-0 mt-0 ring-0 focus-visible:ring-0"
          forceMount={undefined}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

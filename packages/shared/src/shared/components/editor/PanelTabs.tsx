'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@forge/ui/tabs';
import { cn } from '@forge/shared/lib/utils';
import { X } from 'lucide-react';
import { EditorButton } from './EditorButton';

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

export interface PanelTabProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  accentColor?: string;
  closable?: boolean;
  children?: React.ReactNode;
}

/** Tab marker component for declarative PanelTabs children. Exported so declaration emit can reference it (WorkspacePanel.Tab). */
export function PanelTab(_props: PanelTabProps) {
  return null;
}
PanelTab.displayName = 'PanelTabs.Tab';

function isPanelTabChild(
  child: React.ReactNode
): child is React.ReactElement<PanelTabProps & { children?: React.ReactNode }> {
  return React.isValidElement(child) && child.type === PanelTab;
}

function collectTabsFromChildren(children: React.ReactNode): PanelTabDef[] {
  const tabs: PanelTabDef[] = [];
  React.Children.forEach(children, (child) => {
    if (!isPanelTabChild(child)) return;
    const { id, label, icon, accentColor, closable } = child.props;
    tabs.push({
      id,
      label,
      icon,
      accentColor,
      closable,
      content: child.props.children ?? null,
    });
  });
  return tabs;
}

export interface PanelTabsProps {
  /** Tab definitions. When provided, used instead of declarative Tab children. */
  tabs?: PanelTabDef[];
  /** Declarative tab definitions. Use PanelTabs.Tab as children. Ignored when tabs prop is provided. */
  children?: React.ReactNode;
  /** Which tab to show initially when uncontrolled. Defaults to first tab. */
  defaultTabId?: string;
  /** Controlled active tab. Overrides internal state when provided. */
  activeTabId?: string;
  /** Called when a tab is activated. */
  onTabChange?: (id: string) => void;
  /** Called when a closable tab's close button is clicked. Parent must handle removal. */
  onTabClose?: (id: string) => void;
  className?: string;
}

/**
 * PanelTabs — tab bar + content within a single `WorkspacePanel`.
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
  children,
  defaultTabId,
  activeTabId,
  onTabChange,
  onTabClose,
  className,
}: PanelTabsProps) {
  const tabDefs = useMemo(() => {
    if (tabs != null && tabs.length > 0) return tabs;
    const collected = collectTabsFromChildren(children);
    if (collected.length === 0) {
      throw new Error(
        'PanelTabs requires at least one tab via tabs prop or PanelTabs.Tab children.'
      );
    }
    return collected;
  }, [tabs, children]);
  const initialTab = useMemo(() => defaultTabId ?? tabDefs[0]?.id, [defaultTabId, tabDefs]);
  const [internalTab, setInternalTab] = useState(initialTab);
  const currentTab = activeTabId ?? internalTab;

  const handleChange = (value: string) => {
    if (onTabChange) onTabChange(value);
    if (!activeTabId) setInternalTab(value);
  };

  return (
    <Tabs
      key={currentTab}
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
        {tabDefs.map((tab) => {
          const isActive = tab.id === currentTab;
          const accent = tab.accentColor ?? 'var(--context-accent, hsl(var(--primary)))';

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                'min-w-0 flex-1 text-xs rounded-none px-[var(--control-padding-x)] py-[var(--control-padding-y)] truncate leading-tight flex items-center gap-[var(--control-gap)]',
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
                  className="shrink-0 [&_svg]:size-[var(--icon-size)]"
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
              {tab.closable && onTabClose && (
                <EditorButton
                  size="icon"
                  variant="ghost"
                  className="ml-0.5 shrink-0 h-5 w-5 rounded-sm opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  aria-label={`Close ${tab.label}`}
                >
                  <X className="size-3" />
                </EditorButton>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab content panels */}
      {tabDefs.map((tab) => (
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
PanelTabs.Tab = PanelTab;

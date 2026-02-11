'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { AppLayout, type AppLayoutProps } from './AppLayout';
import { AppTab } from './AppTab';
import { AppContent } from './AppContent';
import {
  EditorTabGroup,
  type EditorTabGroupProps,
} from '../editor/EditorTabGroup';

export interface EditorAppProps extends AppLayoutProps {}

// --- EditorApp.Tabs slot components (Menubar, Actions) ---
function TabsMenubar({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
TabsMenubar.displayName = 'EditorApp.Tabs.Menubar';

function TabsActions({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
TabsActions.displayName = 'EditorApp.Tabs.Actions';

function hasAnyTabsSlot(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    if (type === TabsMenubar || type === TabsActions) found = true;
  });
  return found;
}

function collectTabsSlots(children: React.ReactNode): {
  menubar: React.ReactNode;
  actions: React.ReactNode;
  tabChildren: React.ReactNode[];
} {
  let menubar: React.ReactNode = undefined;
  let actions: React.ReactNode = undefined;
  const tabChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      tabChildren.push(child);
      return;
    }
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    if (type === TabsMenubar) {
      menubar = (child as React.ReactElement<{ children?: React.ReactNode }>).props.children;
    } else if (type === TabsActions) {
      actions = (child as React.ReactElement<{ children?: React.ReactNode }>).props.children;
    } else {
      tabChildren.push(child);
    }
  });
  return { menubar, actions, tabChildren };
}

export interface EditorAppTabsProps extends EditorTabGroupProps {}

/**
 * EditorApp.Tabs — tab row with optional Menubar and Actions slots.
 * When slot children are used, place menubar (File, View, etc.) in .Menubar and app actions (project switcher, editor buttons) in .Actions.
 * Props leading/actions remain supported for backward compatibility; slot content overrides when present.
 */
function EditorAppTabs({
  children,
  leading,
  actions,
  label,
  className,
  tabListClassName,
}: EditorAppTabsProps) {
  const useSlots = hasAnyTabsSlot(children);
  const resolved =
    useSlots && React.Children.count(children) > 0
      ? collectTabsSlots(children)
      : { menubar: leading, actions, tabChildren: React.Children.toArray(children) };

  return (
    <EditorTabGroup
      label={label}
      leading={resolved.menubar}
      actions={resolved.actions}
      tabListClassName={tabListClassName}
      className={cn('shrink-0', className)}
    >
      {useSlots ? resolved.tabChildren : children}
    </EditorTabGroup>
  );
}

/**
 * EditorApp — the root application shell.
 *
 * Replaces `AppSpace` in the new naming convention. Contains the editor
 * tab bar and the active editor content area.
 *
 * ## Compound API (slots recommended)
 * ```tsx
 * <EditorApp>
 *   <EditorApp.Tabs label="Editor tabs">
 *     <EditorApp.Tabs.Menubar><EditorMenubar menus={merged} /></EditorApp.Tabs.Menubar>
 *     <EditorApp.Tabs.Actions><ProjectSwitcher ... /><EditorTab ... /></EditorApp.Tabs.Actions>
 *     <EditorApp.Tab label="Forge" ... />
 *   </EditorApp.Tabs>
 *   <EditorApp.Content>...</EditorApp.Content>
 * </EditorApp>
 * ```
 * Props leading/actions also supported (legacy).
 */
function EditorAppRoot({ children, className }: EditorAppProps) {
  return <AppLayout className={className}>{children}</AppLayout>;
}

export const EditorApp = Object.assign(EditorAppRoot, {
  Tabs: Object.assign(EditorAppTabs, { Menubar: TabsMenubar, Actions: TabsActions }),
  Tab: AppTab,
  Content: AppContent,
});

/** Alias for EditorApp; Studio is the semantic root, StudioApp is the tabs + content compound inside it. */
export const StudioApp = EditorApp;

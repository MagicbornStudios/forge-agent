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

function TabsLeft({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
TabsLeft.displayName = 'EditorApp.Tabs.Left';

function TabsMain({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
TabsMain.displayName = 'EditorApp.Tabs.Main';

function TabsRight({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
TabsRight.displayName = 'EditorApp.Tabs.Right';

function hasAnyTabsSlot(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    if (
      type === TabsMenubar ||
      type === TabsActions ||
      type === TabsLeft ||
      type === TabsMain ||
      type === TabsRight
    ) {
      found = true;
    }
  });
  return found;
}

function collectTabsSlots(children: React.ReactNode): {
  leading: React.ReactNode;
  actions: React.ReactNode;
  tabChildren: React.ReactNode[];
} {
  let leading: React.ReactNode = undefined;
  let actions: React.ReactNode = undefined;
  let explicitMainChildren: React.ReactNode[] | null = null;
  const looseChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      looseChildren.push(child);
      return;
    }
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    if (type === TabsMenubar || type === TabsLeft) {
      leading = (child as React.ReactElement<{ children?: React.ReactNode }>).props.children;
    } else if (type === TabsActions || type === TabsRight) {
      actions = (child as React.ReactElement<{ children?: React.ReactNode }>).props.children;
    } else if (type === TabsMain) {
      const mainChildren = React.Children.toArray(
        (child as React.ReactElement<{ children?: React.ReactNode }>).props.children
      );
      explicitMainChildren = [...(explicitMainChildren ?? []), ...mainChildren];
    } else {
      looseChildren.push(child);
    }
  });
  return {
    leading,
    actions,
    tabChildren: explicitMainChildren ?? looseChildren,
  };
}

export interface EditorAppTabsProps extends EditorTabGroupProps {}

/**
 * EditorApp.Tabs — tab row with optional Menubar and Actions slots.
 * When slot children are used, place left content in .Left (or legacy .Menubar), tabs in .Main, and right actions in .Right (or legacy .Actions).
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
      : { leading, actions, tabChildren: React.Children.toArray(children) };

  return (
    <EditorTabGroup
      label={label}
      leading={resolved.leading}
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
 *     <EditorApp.Tabs.Left><EditorMenubar menus={merged} /></EditorApp.Tabs.Left>
 *     <EditorApp.Tabs.Main>
 *       <EditorApp.Tab label="Forge" ... />
 *     </EditorApp.Tabs.Main>
 *     <EditorApp.Tabs.Right><ProjectSwitcher ... /></EditorApp.Tabs.Right>
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
  Tabs: Object.assign(EditorAppTabs, {
    Left: TabsLeft,
    Main: TabsMain,
    Right: TabsRight,
    Menubar: TabsMenubar,
    Actions: TabsActions,
  }),
  Tab: AppTab,
  Content: AppContent,
});

/** Alias for EditorApp; Studio is the semantic root, StudioApp is the tabs + content compound inside it. */
export const StudioApp = EditorApp;

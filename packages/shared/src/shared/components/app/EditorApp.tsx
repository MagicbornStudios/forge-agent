'use client';

import * as React from 'react';
import { AppLayout, type AppLayoutProps } from './AppLayout';
import { AppTabGroup } from './AppTabGroup';
import { AppTab } from './AppTab';
import { AppContent } from './AppContent';

export interface EditorAppProps extends AppLayoutProps {}

/**
 * EditorApp — the root application shell.
 *
 * Replaces `AppSpace` in the new naming convention. Contains the mode
 * tab bar and the active mode content area.
 *
 * ## Compound API
 * ```tsx
 * <EditorApp>
 *   <EditorApp.Tabs label="Mode tabs" actions={...}>
 *     <EditorApp.Tab label="Forge" isActive={...} onSelect={...} />
 *     <EditorApp.Tab label="Characters" isActive={...} onSelect={...} />
 *   </EditorApp.Tabs>
 *   <EditorApp.Content>
 *     {activeMode === 'forge' && <ForgeMode />}
 *     {activeMode === 'character' && <CharacterMode />}
 *   </EditorApp.Content>
 * </EditorApp>
 * ```
 */
function EditorAppRoot({ children, className }: EditorAppProps) {
  return <AppLayout className={className}>{children}</AppLayout>;
}

export const EditorApp = Object.assign(EditorAppRoot, {
  Tabs: AppTabGroup,
  Tab: AppTab,
  Content: AppContent,
});

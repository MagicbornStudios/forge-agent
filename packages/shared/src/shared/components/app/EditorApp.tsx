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
 * Replaces `AppSpace` in the new naming convention. Contains the editor
 * tab bar and the active editor content area.
 *
 * ## Compound API
 * ```tsx
 * <EditorApp>
 *   <EditorApp.Tabs label="Editor tabs" actions={...}>
 *     <EditorApp.Tab label="Forge" isActive={...} onSelect={...} />
 *     <EditorApp.Tab label="Characters" isActive={...} onSelect={...} />
 *   </EditorApp.Tabs>
 *   <EditorApp.Content>
 *     {activeEditor === 'dialogue' && <DialogueEditor />}
 *     {activeEditor === 'character' && <CharacterEditor />}
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

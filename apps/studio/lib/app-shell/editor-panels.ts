/**
 * Per-editor panel specs for View menu toggles and "Restore all panels".
 * Keys match panel.visible.* in AppSettingsRegistrations (tree-as-source); storage is app scope.
 *
 * Used when editors use UI-first EditorDockLayout.Panel (no panel registry).
 * useEditorPanelVisibility falls back here when useEditorPanels returns empty.
 */

export interface EditorPanelSpec {
  id: string;
  label: string;
  key: string;
}

export const EDITOR_PANEL_SPECS: Record<string, EditorPanelSpec[]> = {
  dialogue: [
    { id: 'left', label: 'Library', key: 'panel.visible.dialogue-left' },
    { id: 'main', label: 'Dialogue Graphs', key: 'panel.visible.dialogue-main' },
    { id: 'right', label: 'Inspector', key: 'panel.visible.dialogue-right' },
    { id: 'yarn', label: 'Yarn', key: 'panel.visible.dialogue-yarn' },
    { id: 'chat', label: 'Chat', key: 'panel.visible.dialogue-chat' },
    { id: 'bottom', label: 'Bottom panel', key: 'panel.visible.dialogue-bottom' },
  ],
  character: [
    { id: 'left', label: 'Characters', key: 'panel.visible.character-left' },
    { id: 'main', label: 'Graph', key: 'panel.visible.character-main' },
    { id: 'right', label: 'Properties', key: 'panel.visible.character-right' },
    { id: 'chat', label: 'Chat', key: 'panel.visible.character-chat' },
  ],
};

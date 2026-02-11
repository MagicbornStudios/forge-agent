/**
 * Per-editor panel specs for View menu toggles and "Restore all panels".
 * Keys match apps/studio/lib/settings/schema.ts (panel.visible.*); storage is app scope.
 *
 * @deprecated Prefer panel registry: when an editor uses EditorLayoutProvider + EditorRail + EditorPanel,
 * useEditorPanelVisibility derives specs from the registry. This map is used only as fallback when
 * the registry has no panels for the given editorId.
 */

export interface EditorPanelSpec {
  id: string;
  label: string;
  key: string;
}

export const EDITOR_PANEL_SPECS: Record<string, EditorPanelSpec[]> = {
  dialogue: [
    { id: 'left', label: 'Library', key: 'panel.visible.dialogue-left' },
    { id: 'right', label: 'Inspector', key: 'panel.visible.dialogue-right' },
    { id: 'chat', label: 'Chat', key: 'panel.visible.dialogue-chat' },
    { id: 'bottom', label: 'Bottom panel', key: 'panel.visible.dialogue-bottom' },
  ],
  character: [
    { id: 'left', label: 'Characters', key: 'panel.visible.character-left' },
    { id: 'right', label: 'Properties', key: 'panel.visible.character-right' },
    { id: 'chat', label: 'Chat', key: 'panel.visible.character-chat' },
  ],
};

/**
 * Per-editor panel specs for View menu toggles and "Restore all panels".
 * Keys match apps/studio/lib/settings/schema.ts (panel.visible.*); storage is app scope.
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
    { id: 'bottom', label: 'Bottom panel', key: 'panel.visible.dialogue-bottom' },
  ],
  character: [
    { id: 'left', label: 'Characters', key: 'panel.visible.character-left' },
    { id: 'right', label: 'Properties', key: 'panel.visible.character-right' },
  ],
  video: [
    { id: 'right', label: 'Tracks', key: 'panel.visible.video-right' },
    { id: 'bottom', label: 'Timeline', key: 'panel.visible.video-bottom' },
  ],
  strategy: [
    { id: 'left', label: 'Thread list', key: 'panel.visible.strategy-left' },
    { id: 'right', label: 'Tools panel', key: 'panel.visible.strategy-right' },
  ],
};

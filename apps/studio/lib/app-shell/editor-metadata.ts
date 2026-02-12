import type { EditorId } from './store';

export const EDITOR_VIEWPORT_IDS: Record<EditorId, string> = {
  dialogue: 'dialogue-graph',
  character: 'character-graph',
};

/** Accent color per editor:viewport (settings sidebar, section headers). Inline lookup: VIEWPORT_ACCENT_COLORS[`${editorId}:${viewportId}`] ?? 'var(--context-accent)'. */
export const VIEWPORT_ACCENT_COLORS: Record<string, string> = {
  'dialogue:narrative': 'var(--status-info)',
  'dialogue:storylet': 'var(--graph-edge-choice-1)',
  'character:main': 'var(--graph-edge-choice-2)',
};

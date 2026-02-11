import type { EditorId } from './store';

export const EDITOR_LABELS: Record<EditorId, string> = {
  dialogue: 'Dialogue',
  character: 'Characters',
};

export const EDITOR_SUMMARY: Record<EditorId, string> = {
  dialogue: 'YarnSpinner dialogue graph editor (React Flow)',
  character: 'Character relationship graph (React Flow)',
};

export const EDITOR_VIEWPORT_IDS: Record<EditorId, string> = {
  dialogue: 'dialogue-graph',
  character: 'character-graph',
};

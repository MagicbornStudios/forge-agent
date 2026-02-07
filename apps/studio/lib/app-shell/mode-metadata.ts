import type { EditorModeId } from './store';

export const MODE_LABELS: Record<EditorModeId, string> = {
  dialogue: 'Dialogue',
  video: 'Video',
  character: 'Characters',
  strategy: 'Strategy',
};

export const MODE_EDITOR_SUMMARY: Record<EditorModeId, string> = {
  dialogue: 'YarnSpinner dialogue graph editor (React Flow)',
  video: 'Twick timeline editor',
  character: 'Character relationship graph (React Flow)',
  strategy: 'AI agent strategy editor (assistant-ui chat)',
};

export const MODE_EDITOR_IDS: Record<EditorModeId, string> = {
  dialogue: 'dialogue-graph',
  video: 'video-timeline',
  character: 'character-graph',
  strategy: 'strategy-chat',
};

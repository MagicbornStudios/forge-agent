import type { EditorId } from './store';

export const EDITOR_LABELS: Record<EditorId, string> = {
  dialogue: 'Dialogue',
  video: 'Video',
  character: 'Characters',
  strategy: 'Strategy',
};

export const EDITOR_SUMMARY: Record<EditorId, string> = {
  dialogue: 'YarnSpinner dialogue graph editor (React Flow)',
  video: 'Twick timeline editor',
  character: 'Character relationship graph (React Flow)',
  strategy: 'AI agent strategy editor (assistant-ui chat)',
};

export const EDITOR_VIEWPORT_IDS: Record<EditorId, string> = {
  dialogue: 'dialogue-graph',
  video: 'video-timeline',
  character: 'character-graph',
  strategy: 'strategy-chat',
};

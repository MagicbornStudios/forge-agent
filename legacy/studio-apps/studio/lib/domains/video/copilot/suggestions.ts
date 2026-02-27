import type { DomainSuggestion } from '@forge/shared/copilot/types';
import { getVideoDocData, type VideoDoc } from '../types';

export interface VideoSuggestionsDeps {
  doc: VideoDoc | null;
}

/** Produce context-aware chat suggestions for the video domain. */
export function getVideoSuggestions(deps: VideoSuggestionsDeps): DomainSuggestion[] {
  const { doc } = deps;
  const suggestions: DomainSuggestion[] = [];
  const data = getVideoDocData(doc);

  if (!doc || data.tracks.length === 0) {
    suggestions.push({
      title: 'Add a track',
      message: 'Add a video track to the timeline to get started.',
    });
    return suggestions;
  }

  const hasElements = data.tracks.some((t) => t.elements.length > 0);
  if (!hasElements) {
    suggestions.push({
      title: 'Add elements',
      message: 'Add video or text elements to your tracks.',
    });
  }

  if (data.sceneOverrides.length === 0) {
    suggestions.push({
      title: 'Set scene mood',
      message: 'Set a scene override to change the mood or lighting at a specific point in the timeline.',
    });
  }

  if (data.tracks.length > 1) {
    suggestions.push({
      title: 'Preview timeline',
      message: 'Describe the current timeline structure and suggest improvements.',
    });
  }

  return suggestions;
}

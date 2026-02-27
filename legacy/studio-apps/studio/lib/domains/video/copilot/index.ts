'use client';

import { useMemo } from 'react';
import type { DomainCopilotContract, AIHighlightPayload } from '@forge/shared/copilot/types';
import type { Selection } from '@forge/shared';
import type { VideoDoc, VideoPatchOp } from '../types';
import { createVideoActions } from './actions';
import { buildVideoContext } from './context';
import { getVideoSuggestions } from './suggestions';

/** Dependencies required to build the video copilot contract. */
export interface VideoCopilotDeps {
  doc: VideoDoc | null;
  selection: Selection | null;
  applyOperations: (ops: VideoPatchOp[]) => void;
  onAIHighlight: (payload: AIHighlightPayload) => void;
  clearAIHighlights: () => void;
}

/**
 * Build the video domain's `DomainCopilotContract`.
 *
 * Usage in the video workspace component:
 * ```ts
 * const videoContract = useVideoContract(deps);
 * useDomainCopilot(videoContract);
 * ```
 */
export function useVideoContract(deps: VideoCopilotDeps): DomainCopilotContract {
  const { doc, selection, applyOperations, onAIHighlight, clearAIHighlights } = deps;

  return useMemo<DomainCopilotContract>(
    () => ({
      domain: 'video',

      getContextSnapshot: () => buildVideoContext({ doc, selection }),

      getInstructions: () =>
        'You are helping edit a video timeline. The timeline has tracks containing elements (video, audio, text, captions). ' +
        'Use video_* actions. The timeline is linked to a forge dialogue graph -- scene overrides can change visual ' +
        'properties (lighting, mood, music, etc.) per graph node at specific times.',

      createActions: () =>
        createVideoActions({
          getDoc: () => doc,
          applyOperations,
          onAIHighlight,
        }),

      getSuggestions: () => getVideoSuggestions({ doc }),

      onAIHighlight,
      clearAIHighlights,
    }),
    [doc, selection, applyOperations, onAIHighlight, clearAIHighlights],
  );
}

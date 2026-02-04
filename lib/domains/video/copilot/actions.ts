import type { CopilotActionConfig, AIHighlightPayload } from '@/shared/copilot/types';
import type { VideoDoc, VideoPatchOp } from '../types';

export interface VideoActionsDeps {
  getDoc: () => VideoDoc | null;
  applyOperations: (ops: VideoPatchOp[]) => void;
  onAIHighlight: (payload: AIHighlightPayload) => void;
}

/**
 * Factory: produce all CopilotKit action configs for the video domain.
 *
 * All action names are prefixed with `video_` to prevent collisions.
 */
export function createVideoActions(deps: VideoActionsDeps): CopilotActionConfig[] {
  const { getDoc, applyOperations, onAIHighlight } = deps;

  return [
    // -----------------------------------------------------------------------
    // video_addTrack
    // -----------------------------------------------------------------------
    {
      name: 'video_addTrack',
      description: 'Add a new track to the timeline (e.g. video, audio, text overlay, caption).',
      parameters: [
        { name: 'name', type: 'string' as const, description: 'Track name', required: true },
        { name: 'trackType', type: 'string' as const, description: 'Track type: video, audio, text, caption', required: false },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{ type: 'addTrack', name: args.name as string, trackType: args.trackType as string | undefined }]);
        return { success: true, message: `Added track: ${String(args.name)}` };
      },
    },

    // -----------------------------------------------------------------------
    // video_removeTrack
    // -----------------------------------------------------------------------
    {
      name: 'video_removeTrack',
      description: 'Remove a track from the timeline.',
      parameters: [
        { name: 'trackId', type: 'string' as const, description: 'Track ID to remove', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{ type: 'removeTrack', trackId: args.trackId as string }]);
        return { success: true, message: `Removed track ${String(args.trackId)}` };
      },
    },

    // -----------------------------------------------------------------------
    // video_addElement
    // -----------------------------------------------------------------------
    {
      name: 'video_addElement',
      description: 'Add an element (clip, text, audio) to a track at a specific time range.',
      parameters: [
        { name: 'trackId', type: 'string' as const, description: 'Track to add element to', required: true },
        { name: 'elementType', type: 'string' as const, description: 'Element type: video, audio, text, caption, image', required: true },
        { name: 'start', type: 'number' as const, description: 'Start time in seconds', required: true },
        { name: 'end', type: 'number' as const, description: 'End time in seconds', required: true },
        { name: 'nodeId', type: 'string' as const, description: 'Optional forge graph node ID to link this element to', required: false },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{
          type: 'addElement',
          trackId: args.trackId as string,
          elementType: args.elementType as string,
          start: args.start as number,
          end: args.end as number,
          nodeId: args.nodeId as string | undefined,
        }]);
        onAIHighlight({ entities: { 'video.element': [args.trackId as string] } });
        return { success: true, message: `Added ${String(args.elementType)} element to track` };
      },
    },

    // -----------------------------------------------------------------------
    // video_moveElement
    // -----------------------------------------------------------------------
    {
      name: 'video_moveElement',
      description: 'Move an element to a new start time on its track.',
      parameters: [
        { name: 'trackId', type: 'string' as const, description: 'Track ID', required: true },
        { name: 'elementId', type: 'string' as const, description: 'Element ID', required: true },
        { name: 'newStart', type: 'number' as const, description: 'New start time in seconds', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{
          type: 'moveElement',
          trackId: args.trackId as string,
          elementId: args.elementId as string,
          newStart: args.newStart as number,
        }]);
        return { success: true, message: `Moved element to ${String(args.newStart)}s` };
      },
    },

    // -----------------------------------------------------------------------
    // video_resizeElement
    // -----------------------------------------------------------------------
    {
      name: 'video_resizeElement',
      description: 'Resize an element by setting new start and end times.',
      parameters: [
        { name: 'trackId', type: 'string' as const, description: 'Track ID', required: true },
        { name: 'elementId', type: 'string' as const, description: 'Element ID', required: true },
        { name: 'start', type: 'number' as const, description: 'New start time', required: true },
        { name: 'end', type: 'number' as const, description: 'New end time', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{
          type: 'resizeElement',
          trackId: args.trackId as string,
          elementId: args.elementId as string,
          start: args.start as number,
          end: args.end as number,
        }]);
        return { success: true, message: `Resized element` };
      },
    },

    // -----------------------------------------------------------------------
    // video_removeElement
    // -----------------------------------------------------------------------
    {
      name: 'video_removeElement',
      description: 'Remove an element from a track.',
      parameters: [
        { name: 'trackId', type: 'string' as const, description: 'Track ID', required: true },
        { name: 'elementId', type: 'string' as const, description: 'Element ID', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{
          type: 'removeElement',
          trackId: args.trackId as string,
          elementId: args.elementId as string,
        }]);
        return { success: true, message: `Removed element ${String(args.elementId)}` };
      },
    },

    // -----------------------------------------------------------------------
    // video_setSceneOverride
    // -----------------------------------------------------------------------
    {
      name: 'video_setSceneOverride',
      description:
        'Set a scene property override for a specific graph node on the timeline. Use this to change lighting, mood, music, etc. at a specific point in the story.',
      parameters: [
        { name: 'nodeId', type: 'string' as const, description: 'Forge graph node ID this override is for', required: true },
        { name: 'property', type: 'string' as const, description: 'Scene property: background, lighting, mood, music, ambience, cameraAngle', required: true },
        { name: 'value', type: 'string' as const, description: 'Override value', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{
          type: 'setSceneOverride',
          nodeId: args.nodeId as string,
          property: args.property as string,
          value: args.value,
        }]);
        onAIHighlight({ entities: { 'video.sceneOverride': [`${String(args.nodeId)}.${String(args.property)}`] } });
        return { success: true, message: `Set ${String(args.property)} override for node ${String(args.nodeId)}` };
      },
    },

    // -----------------------------------------------------------------------
    // video_getTimeline
    // -----------------------------------------------------------------------
    {
      name: 'video_getTimeline',
      description: 'Get the current timeline state including all tracks, elements, and scene overrides.',
      parameters: [],
      handler: async () => {
        const doc = getDoc();
        if (!doc) return { success: false, message: 'No video document loaded' };

        return {
          success: true,
          message: 'Timeline retrieved',
          data: {
            title: doc.title,
            resolution: doc.resolution,
            trackCount: doc.tracks.length,
            tracks: doc.tracks.map((t) => ({
              id: t.id,
              name: t.name,
              type: t.type,
              elementCount: t.elements.length,
              elements: t.elements.map((el) => ({
                id: el.id,
                type: el.type,
                start: el.start,
                end: el.end,
                nodeId: el.nodeId,
              })),
            })),
            sceneOverrides: doc.sceneOverrides,
          },
        };
      },
    },

    // -----------------------------------------------------------------------
    // video_reorderTracks
    // -----------------------------------------------------------------------
    {
      name: 'video_reorderTracks',
      description: 'Reorder tracks by providing the track IDs in the desired order.',
      parameters: [
        { name: 'trackIds', type: 'string[]' as const, description: 'Track IDs in desired order', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{ type: 'reorderTracks', trackIds: args.trackIds as string[] }]);
        return { success: true, message: 'Tracks reordered' };
      },
    },

    // -----------------------------------------------------------------------
    // video_setResolution
    // -----------------------------------------------------------------------
    {
      name: 'video_setResolution',
      description: 'Set the video output resolution.',
      parameters: [
        { name: 'width', type: 'number' as const, description: 'Width in pixels', required: true },
        { name: 'height', type: 'number' as const, description: 'Height in pixels', required: true },
      ],
      handler: async (args: Record<string, unknown>) => {
        applyOperations([{ type: 'setResolution', width: args.width as number, height: args.height as number }]);
        return { success: true, message: `Resolution set to ${String(args.width)}x${String(args.height)}` };
      },
    },
  ];
}

import type { SceneOverride } from './scene-overrides';
import type { VideoDocRecord as PayloadVideoDocRecord } from '@forge/types/payload';

// ---------------------------------------------------------------------------
// Video document model
// ---------------------------------------------------------------------------

/** A single element on a timeline track. */
export interface VideoElement {
  id: string;
  type: string; // 'video' | 'audio' | 'text' | 'caption' | 'image'
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
  /** Arbitrary element properties (src, text, style, etc.). */
  props: Record<string, unknown>;
  /** Optional link to a forge graph node (for scene override sync). */
  nodeId?: string;
}

/** A single timeline track containing elements. */
export interface VideoTrack {
  id: string;
  name: string;
  type: string; // 'video' | 'audio' | 'text' | 'caption'
  elements: VideoElement[];
}

/** Top-level video workspace document. */
export interface VideoDoc {
  id: string;
  /** Reference to the forge graph this video is derived from. */
  graphId: string | number;
  title: string;
  tracks: VideoTrack[];
  sceneOverrides: SceneOverride[];
  resolution: { width: number; height: number };
  createdAt?: string;
  updatedAt?: string;
}

// Persisted payload shape (stored in `video-docs` collection).
export type VideoDocRecord = PayloadVideoDocRecord;

// ---------------------------------------------------------------------------
// Video patch operations
// ---------------------------------------------------------------------------

/** Discriminant union of all video/timeline mutations. */
export type VideoPatchOp =
  | { type: 'addTrack'; name: string; trackType?: string }
  | { type: 'removeTrack'; trackId: string }
  | { type: 'addElement'; trackId: string; elementType: string; start: number; end: number; props?: Record<string, unknown>; nodeId?: string }
  | { type: 'removeElement'; trackId: string; elementId: string }
  | { type: 'moveElement'; trackId: string; elementId: string; newStart: number }
  | { type: 'resizeElement'; trackId: string; elementId: string; start: number; end: number }
  | { type: 'updateElementProps'; trackId: string; elementId: string; props: Record<string, unknown> }
  | { type: 'setSceneOverride'; nodeId: string; property: string; value: unknown; startTime?: number; endTime?: number }
  | { type: 'removeSceneOverride'; nodeId: string; property: string }
  | { type: 'reorderTracks'; trackIds: string[] }
  | { type: 'setResolution'; width: number; height: number };

/** Operation type constants (mirrors the discriminant). */
export const VIDEO_PATCH_OP = {
  ADD_TRACK: 'addTrack',
  REMOVE_TRACK: 'removeTrack',
  ADD_ELEMENT: 'addElement',
  REMOVE_ELEMENT: 'removeElement',
  MOVE_ELEMENT: 'moveElement',
  RESIZE_ELEMENT: 'resizeElement',
  UPDATE_ELEMENT_PROPS: 'updateElementProps',
  SET_SCENE_OVERRIDE: 'setSceneOverride',
  REMOVE_SCENE_OVERRIDE: 'removeSceneOverride',
  REORDER_TRACKS: 'reorderTracks',
  SET_RESOLUTION: 'setResolution',
} as const;


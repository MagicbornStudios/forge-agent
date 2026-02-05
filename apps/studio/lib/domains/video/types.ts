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

// Persisted payload shape (stored in `video-docs` collection).
// The timeline content lives in `VideoDoc.doc` and is modeled by `VideoDocData`.
export type VideoDoc = PayloadVideoDocRecord;
export type VideoDocRecord = PayloadVideoDocRecord;

/** Minimal timeline payload stored in VideoDoc.doc */
export interface VideoDocData {
  tracks: VideoTrack[];
  sceneOverrides: SceneOverride[];
  resolution: { width: number; height: number };
}

export const DEFAULT_VIDEO_DOC_DATA: VideoDocData = {
  tracks: [],
  sceneOverrides: [],
  resolution: { width: 1920, height: 1080 },
};

export function getVideoDocData(doc: VideoDoc | null): VideoDocData {
  if (!doc || !doc.doc || typeof doc.doc !== 'object' || Array.isArray(doc.doc)) {
    return { ...DEFAULT_VIDEO_DOC_DATA };
  }
  return {
    ...DEFAULT_VIDEO_DOC_DATA,
    ...(doc.doc as Partial<VideoDocData>),
  };
}

export function setVideoDocData(doc: VideoDoc, data: VideoDocData): VideoDoc {
  return {
    ...doc,
    doc: data as unknown as VideoDoc['doc'],
  };
}

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


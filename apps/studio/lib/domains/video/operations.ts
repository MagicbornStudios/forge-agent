import {
  getVideoDocData,
  setVideoDocData,
  type VideoDoc,
  type VideoDocData,
  type VideoPatchOp,
  type VideoTrack,
  type VideoElement,
} from './types';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Immutable reducer: apply a single video patch operation to a document.
 * Returns a new document; the input is never mutated.
 */
export function applyVideoOperation(doc: VideoDoc, op: VideoPatchOp): VideoDoc {
  const data: VideoDocData = deepClone(getVideoDocData(doc));

  switch (op.type) {
    // ----- Tracks -----
    case 'addTrack': {
      const track: VideoTrack = {
        id: genId('track'),
        name: op.name,
        type: op.trackType ?? 'video',
        elements: [],
      };
      data.tracks.push(track);
      break;
    }
    case 'removeTrack': {
      data.tracks = data.tracks.filter((t) => t.id !== op.trackId);
      break;
    }
    case 'reorderTracks': {
      const map = new Map(data.tracks.map((t) => [t.id, t]));
      data.tracks = op.trackIds.map((id) => map.get(id)).filter(Boolean) as VideoTrack[];
      break;
    }

    // ----- Elements -----
    case 'addElement': {
      const track = data.tracks.find((t) => t.id === op.trackId);
      if (track) {
        const el: VideoElement = {
          id: genId('el'),
          type: op.elementType,
          start: op.start,
          end: op.end,
          props: op.props ?? {},
          nodeId: op.nodeId,
        };
        track.elements.push(el);
      }
      break;
    }
    case 'removeElement': {
      const track = data.tracks.find((t) => t.id === op.trackId);
      if (track) {
        track.elements = track.elements.filter((e) => e.id !== op.elementId);
      }
      break;
    }
    case 'moveElement': {
      const track = data.tracks.find((t) => t.id === op.trackId);
      const el = track?.elements.find((e) => e.id === op.elementId);
      if (el) {
        const duration = el.end - el.start;
        el.start = op.newStart;
        el.end = op.newStart + duration;
      }
      break;
    }
    case 'resizeElement': {
      const track = data.tracks.find((t) => t.id === op.trackId);
      const el = track?.elements.find((e) => e.id === op.elementId);
      if (el) {
        el.start = op.start;
        el.end = op.end;
      }
      break;
    }
    case 'updateElementProps': {
      const track = data.tracks.find((t) => t.id === op.trackId);
      const el = track?.elements.find((e) => e.id === op.elementId);
      if (el) {
        el.props = { ...el.props, ...op.props };
      }
      break;
    }

    // ----- Scene overrides -----
    case 'setSceneOverride': {
      // Remove existing override for same nodeId + property, then add new
      data.sceneOverrides = data.sceneOverrides.filter(
        (o) => !(o.nodeId === op.nodeId && o.property === op.property),
      );
      data.sceneOverrides.push({
        nodeId: op.nodeId,
        property: op.property,
        value: op.value,
        startTime: op.startTime,
        endTime: op.endTime,
      });
      break;
    }
    case 'removeSceneOverride': {
      data.sceneOverrides = data.sceneOverrides.filter(
        (o) => !(o.nodeId === op.nodeId && o.property === op.property),
      );
      break;
    }

    // ----- Resolution -----
    case 'setResolution': {
      data.resolution = { width: op.width, height: op.height };
      break;
    }
  }

  return setVideoDocData(doc, data);
}

/** Batch-apply multiple operations left-to-right. */
export function applyVideoOperations(doc: VideoDoc, ops: VideoPatchOp[]): VideoDoc {
  let result = doc;
  for (const op of ops) {
    result = applyVideoOperation(result, op);
  }
  return result;
}

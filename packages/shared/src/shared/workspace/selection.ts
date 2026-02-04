/**
 * Shared selection model. Every editor emits selection into this shape.
 * Inspector, chat, and draft highlight key off the same contract.
 */

/** Discriminant union: adapter-friendly shape for all domains. */
export type Selection =
  | { type: 'none' }
  | SelectionEntity
  | SelectionTextRange
  | SelectionCanvasObject;

export interface SelectionEntity {
  type: 'entity';
  entityType: string; // e.g. 'forge.node', 'forge.edge', 'characters.cell'
  id: string;
  ref?: string;
  meta?: Record<string, unknown>;
}

export interface SelectionTextRange {
  type: 'textRange';
  anchor: { key: string; offset: number };
  focus: { key: string; offset: number };
  textPreview?: string;
  meta?: Record<string, unknown>;
}

export interface SelectionCanvasObject {
  type: 'canvasObject';
  system: string; // e.g. 'twick', 'joints'
  id: string;
  meta?: Record<string, unknown>;
}

/** Legacy kind-based selection (still supported). Map to entity in adapters. */
export type SelectionKind =
  | 'forge.node'
  | 'forge.edge'
  | 'writer.block'
  | 'writer.range'
  | 'characters.element'
  | 'characters.link'
  | 'video.layer'
  | 'video.track'
  | 'video.keyframe';

export interface LegacySelection {
  kind: SelectionKind;
  id: string;
  ref?: string;
  range?: { anchor: { key: string; offset: number }; focus: { key: string; offset: number } };
  meta?: Record<string, unknown>;
}

export function isNone(s: Selection | LegacySelection | null | undefined): boolean {
  if (s == null) return true;
  return 'type' in s && s.type === 'none';
}

export function isEntity(s: Selection): s is SelectionEntity {
  return s.type === 'entity';
}

export function isTextRange(s: Selection): s is SelectionTextRange {
  return s.type === 'textRange';
}

export function isCanvasObject(s: Selection): s is SelectionCanvasObject {
  return s.type === 'canvasObject';
}

/** Convert legacy kind+id to entity selection. */
export function toEntitySelection(kind: SelectionKind, id: string, meta?: Record<string, unknown>): SelectionEntity {
  return { type: 'entity', entityType: kind, id, meta };
}

export function isSelection(x: unknown): x is Selection {
  if (x == null || typeof x !== 'object') return false;
  const t = (x as Selection).type;
  return t === 'none' || t === 'entity' || t === 'textRange' || t === 'canvasObject';
}

export type PatchKind = 'reactflow' | 'lexical' | 'videoDoc';

export type PatchEnvelope<K extends PatchKind = PatchKind, Ops = unknown> = {
  kind: K;
  /** Opaque operations for the given kind (ReactFlow ops, Lexical ops, Video ops). */
  ops: Ops;
  /** One-paragraph human summary for review UI. */
  summary: string;
  /** Optional machine metadata (selection, model, traces, etc). */
  meta?: Record<string, unknown>;
};

export type ReviewResult = {
  ok: boolean;
  warnings?: string[];
  errors?: string[];
};
